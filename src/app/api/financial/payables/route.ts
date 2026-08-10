import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"
import { payableSchema, resolveAndValidate } from "./shared"

export async function GET() {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const payables = await prisma.payable.findMany({
    where: { companyId: session.user.companyId },
    include: {
      group: { select: { id: true, name: true } },
      installments: {
        orderBy: { installmentNumber: "asc" },
        include: { paymentMethod: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(payables)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const companyId = session.user.companyId
  const body = await req.json()
  const parsed = payableSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const data = parsed.data

  const resolved = await resolveAndValidate(data, companyId)
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 })
  }

  const payable = await prisma.payable.create({
    data: {
      payeeName: resolved.payeeName,
      description: data.description,
      totalAmount: data.totalAmount,
      issueDate: data.issueDate ?? null,
      supplierId: data.supplierId || null,
      createdByName: session.user.name ?? "Desconhecido",
      groupId: data.groupId,
      companyId,
      installments: {
        create: data.installments.map((inst, index) => ({
          installmentNumber: index + 1,
          amount: inst.amount,
          dueDate: inst.dueDate,
          paymentMethodId: inst.paymentMethodId,
          groupId: data.groupId,
          companyId,
        })),
      },
    },
    include: { installments: { orderBy: { installmentNumber: "asc" } } },
  })

  return NextResponse.json(payable, { status: 201 })
}
