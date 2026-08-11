import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { paymentMethodRequiresDocumentNumber } from "@/lib/financial"

// issueDate é opcional e chega como "" quando o campo é deixado vazio no
// formulário. Sem esse preprocess, z.coerce.date() tenta `new Date("")`
// (Invalid Date) e o Zod rejeita com uma mensagem confusa ("expected date,
// received Date") em vez de simplesmente tratar como "sem data".
const optionalDate = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.coerce.date().nullable()
)

// Cada item é uma parcela/boleto. "id" ausente = parcela nova; usado só no PUT
// de edição para diferenciar "atualizar parcela existente" de "criar nova".
const installmentInputSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive("Valor da parcela deve ser maior que zero"),
  dueDate: z.coerce.date(),
  paymentMethodId: z.string().min(1, "Forma de pagamento é obrigatória"),
  documentNumber: z.string().trim().max(100, "Número do documento muito longo").optional().nullable(),
})

export const payableSchema = z
  .object({
    groupId: z.string().min(1, "Grupo é obrigatório"),
    supplierId: z.string().optional().nullable(),
    payeeName: z.string().optional(),
    description: z.string().min(1, "Descrição é obrigatória"),
    totalAmount: z.number().positive("Valor total deve ser maior que zero"),
    issueDate: optionalDate.optional(),
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

// Lançamento (Payable) já existente sendo editado — passado só pelo PUT.
// Usado pra não travar a edição de um registro antigo que já usa um grupo ou
// forma de pagamento que foi inativado depois de criado.
type ExistingPayable = {
  groupId: string
  installments: { paymentMethodId: string }[]
}

// Valida grupo, fornecedor (se houver) e formas de pagamento contra o companyId
// da sessão — nunca confia em ids vindos do cliente sem checar que pertencem
// à mesma empresa (regra de ouro do multi-tenant). Também bloqueia usar um
// grupo/forma de pagamento inativo — exceto se já era esse mesmo valor no
// registro sendo editado, pra edição de dados antigos não quebrar.
export async function resolveAndValidate(data: PayableInput, companyId: string, existing?: ExistingPayable | null) {
  const sum = data.installments.reduce((acc, i) => acc + i.amount, 0)
  if (Math.abs(sum - data.totalAmount) > 0.01) {
    return {
      error: `A soma das parcelas (R$ ${sum.toFixed(2)}) deve bater com o valor total (R$ ${data.totalAmount.toFixed(2)}).`,
    } as const
  }

  const group = await prisma.payableGroup.findFirst({ where: { id: data.groupId, companyId } })
  if (!group) return { error: "Grupo inválido." } as const
  if (!group.isActive && data.groupId !== existing?.groupId) {
    return { error: "Grupo inativo — selecione outro." } as const
  }

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

  const previouslyUsedMethodIds = new Set(existing?.installments.map((i) => i.paymentMethodId) ?? [])
  const newlyUsedInactiveMethod = paymentMethods.find((m) => !m.isActive && !previouslyUsedMethodIds.has(m.id))
  if (newlyUsedInactiveMethod) {
    return { error: `Forma de pagamento "${newlyUsedInactiveMethod.name}" está inativa — selecione outra.` } as const
  }

  // Boleto/cheque exigem número de documento — checado aqui (não só no
  // formulário) porque o front-end não é a única forma de chamar essa API.
  const methodNameById = new Map(paymentMethods.map((m) => [m.id, m.name]))
  const missingDocIndex = data.installments.findIndex((inst) => {
    const methodName = methodNameById.get(inst.paymentMethodId) ?? ""
    return paymentMethodRequiresDocumentNumber(methodName) && !inst.documentNumber?.trim()
  })
  if (missingDocIndex !== -1) {
    return {
      error: `Informe o número do documento da parcela ${missingDocIndex + 1} (obrigatório para boleto/cheque).`,
    } as const
  }

  return { payeeName } as const
}
