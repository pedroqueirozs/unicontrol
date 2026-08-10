import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"

// Marca uma parcela como paga (com data de quitação) ou desfaz o marcador
// (volta pra pendente) — usado quando a proprietária avisa que quitou um
// boleto, ou pra corrigir um clique errado.
const patchSchema = z.object({
  status: z.enum(["pendente", "pago"]),
  paidAt: z.coerce.date().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const existing = await prisma.payableInstallment.findFirst({
    where: { id, companyId: session.user.companyId },
  })
  if (!existing) return new NextResponse("Not Found", { status: 404 })

  const updated = await prisma.payableInstallment.update({
    where: { id },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "pago" ? (parsed.data.paidAt ?? new Date()) : null,
    },
  })

  return NextResponse.json(updated)
}
