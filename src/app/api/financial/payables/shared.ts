import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Cada item é uma parcela/boleto. "id" ausente = parcela nova; usado só no PUT
// de edição para diferenciar "atualizar parcela existente" de "criar nova".
const installmentInputSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive("Valor da parcela deve ser maior que zero"),
  dueDate: z.coerce.date(),
  paymentMethodId: z.string().min(1, "Forma de pagamento é obrigatória"),
  documentNumber: z.string().optional().nullable(),
})

export const payableSchema = z
  .object({
    groupId: z.string().min(1, "Grupo é obrigatório"),
    supplierId: z.string().optional().nullable(),
    payeeName: z.string().optional(),
    description: z.string().min(1, "Descrição é obrigatória"),
    totalAmount: z.number().positive("Valor total deve ser maior que zero"),
    issueDate: z.coerce.date().optional().nullable(),
    installments: z.array(installmentInputSchema).min(1, "Informe ao menos uma parcela"),
  })
  .refine((data) => data.supplierId || (data.payeeName && data.payeeName.trim().length > 0), {
    message: "Informe o fornecedor ou um nome",
    path: ["payeeName"],
  })
  .refine((data) => !data.issueDate || data.issueDate.getTime() <= Date.now(), {
    message: "Data de emissão não pode ser futura",
    path: ["issueDate"],
  })

export type PayableInput = z.infer<typeof payableSchema>

// Valida grupo, fornecedor (se houver) e formas de pagamento contra o companyId
// da sessão — nunca confia em ids vindos do cliente sem checar que pertencem
// à mesma empresa (regra de ouro do multi-tenant).
export async function resolveAndValidate(data: PayableInput, companyId: string) {
  const sum = data.installments.reduce((acc, i) => acc + i.amount, 0)
  if (Math.abs(sum - data.totalAmount) > 0.01) {
    return {
      error: `A soma das parcelas (R$ ${sum.toFixed(2)}) deve bater com o valor total (R$ ${data.totalAmount.toFixed(2)}).`,
    } as const
  }

  const group = await prisma.payableGroup.findFirst({ where: { id: data.groupId, companyId } })
  if (!group) return { error: "Grupo inválido." } as const

  let payeeName = data.payeeName?.trim() || ""
  if (data.supplierId) {
    const supplier = await prisma.supplier.findFirst({ where: { id: data.supplierId, companyId } })
    if (!supplier) return { error: "Fornecedor inválido." } as const
    payeeName = supplier.name
  }

  const paymentMethodIds = [...new Set(data.installments.map((i) => i.paymentMethodId))]
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { id: { in: paymentMethodIds }, companyId },
  })
  if (paymentMethods.length !== paymentMethodIds.length) {
    return { error: "Forma de pagamento inválida." } as const
  }

  return { payeeName } as const
}
