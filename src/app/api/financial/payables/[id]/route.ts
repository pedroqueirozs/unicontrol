import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"
import { payableSchema, resolveAndValidate } from "../shared"

export async function GET(
  _req: Request,
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
  const payable = await prisma.payable.findFirst({
    where: { id, companyId: session.user.companyId },
    include: {
      group: { select: { id: true, name: true } },
      installments: {
        orderBy: { installmentNumber: "asc" },
        include: { paymentMethod: { select: { id: true, name: true } } },
      },
    },
  })
  if (!payable) return new NextResponse("Not Found", { status: 404 })

  return NextResponse.json(payable)
}

// Edição: atualiza o cabeçalho e reconcilia as parcelas por diff (não apaga e
// recria tudo) — parcelas mantidas (mesmo "id") preservam status/paidAt, ou
// seja, editar um lançamento não desfaz quitações já registradas. Parcelas
// removidas da lista só são excluídas do banco aqui, na confirmação (RN-16).
export async function PUT(
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

  const companyId = session.user.companyId
  const { id } = await params
  const body = await req.json()
  const parsed = payableSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const data = parsed.data

  const existing = await prisma.payable.findFirst({
    where: { id, companyId },
    include: { installments: true },
  })
  if (!existing) return new NextResponse("Not Found", { status: 404 })

  const resolved = await resolveAndValidate(data, companyId, existing)
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 })
  }

  const existingIds = new Set(existing.installments.map((i) => i.id))
  const incomingIds = new Set(data.installments.filter((i) => i.id).map((i) => i.id!))
  const idsToDelete = [...existingIds].filter((existingId) => !incomingIds.has(existingId))

  await prisma.$transaction(async (tx) => {
    await tx.payable.update({
      where: { id },
      data: {
        payeeName: resolved.payeeName,
        description: data.description,
        totalAmount: data.totalAmount,
        issueDate: data.issueDate ?? null,
        supplierId: data.supplierId || null,
        groupId: data.groupId,
      },
    })

    if (idsToDelete.length > 0) {
      await tx.payableInstallment.deleteMany({ where: { id: { in: idsToDelete }, payableId: id } })
    }

    for (const [index, inst] of data.installments.entries()) {
      if (inst.id && existingIds.has(inst.id)) {
        await tx.payableInstallment.update({
          where: { id: inst.id },
          data: {
            installmentNumber: index + 1,
            amount: inst.amount,
            dueDate: inst.dueDate,
            paymentMethodId: inst.paymentMethodId,
            documentNumber: inst.documentNumber || null,
            groupId: data.groupId,
          },
        })
      } else {
        await tx.payableInstallment.create({
          data: {
            payableId: id,
            installmentNumber: index + 1,
            amount: inst.amount,
            dueDate: inst.dueDate,
            paymentMethodId: inst.paymentMethodId,
            documentNumber: inst.documentNumber || null,
            groupId: data.groupId,
            companyId,
          },
        })
      }
    }
  })

  const updated = await prisma.payable.findFirst({
    where: { id },
    include: { installments: { orderBy: { installmentNumber: "asc" } } },
  })

  return NextResponse.json(updated)
}

// Exclusão livre, mesmo com parcelas já pagas (decisão do Pedro — é controle
// interno, não livro fiscal auditado). Cascade apaga as parcelas junto.
export async function DELETE(
  _req: Request,
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
  const existing = await prisma.payable.findFirst({
    where: { id, companyId: session.user.companyId },
  })
  if (!existing) return new NextResponse("Not Found", { status: 404 })

  await prisma.payable.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
