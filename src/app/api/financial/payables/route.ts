import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"
import { payableSchema, resolveAndValidate } from "./shared"

// A listagem de Lançamentos é por parcela (uma linha por parcela, não por
// lançamento), então a paginação/filtro aqui é feita direto na tabela
// PayableInstallment — ela já tem companyId/groupId/status/dueDate
// denormalizados (com índice) exatamente pra isso, sem precisar trazer todos
// os Payable com todas as parcelas pra filtrar em memória.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.companyId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!isAdminLevel(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const companyId = session.user.companyId
  const { searchParams } = new URL(req.url)

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "50", 10) || 50))
  const groupId = searchParams.get("groupId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")?.trim()

  const where = {
    companyId,
    ...(groupId && groupId !== "todos" ? { groupId } : {}),
    ...(search
      ? {
          payable: {
            OR: [
              { payeeName: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
    ...(status === "pago" ? { status: "pago" as const } : {}),
    // "Vencida" não é um status próprio no banco — é "pendente" com dueDate no
    // passado. O corte usa meia-noite UTC porque dueDate é salvo como data pura
    // (meia-noite UTC vinda do <input type="date">); assim o filtro não muda
    // conforme o fuso horário de quem está acessando.
    ...(status === "pendente" || status === "vencida"
      ? {
          status: "pendente" as const,
          dueDate: (() => {
            const startOfToday = new Date()
            startOfToday.setUTCHours(0, 0, 0, 0)
            return status === "vencida" ? { lt: startOfToday } : { gte: startOfToday }
          })(),
        }
      : {}),
  }

  const [installments, total] = await Promise.all([
    prisma.payableInstallment.findMany({
      where,
      orderBy: { dueDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        paymentMethod: { select: { id: true, name: true } },
        payable: {
          select: {
            id: true,
            payeeName: true,
            description: true,
            createdAt: true,
            groupId: true,
            group: { select: { id: true, name: true } },
            _count: { select: { installments: true } },
          },
        },
      },
    }),
    prisma.payableInstallment.count({ where }),
  ])

  const rows = installments.map(({ payable, ...inst }) => ({
    ...inst,
    payable: {
      id: payable.id,
      payeeName: payable.payeeName,
      description: payable.description,
      createdAt: payable.createdAt,
      groupId: payable.groupId,
      group: payable.group,
      installmentsCount: payable._count.installments,
    },
  }))

  return NextResponse.json({ rows, total, page, pageSize })
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
          documentNumber: inst.documentNumber || null,
          groupId: data.groupId,
          companyId,
        })),
      },
    },
    include: { installments: { orderBy: { installmentNumber: "asc" } } },
  })

  return NextResponse.json(payable, { status: 201 })
}
