import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"

// Teto de segurança — um relatório busca tudo que bate com o filtro (não é
// paginado, o ponto é totalizar), mas isso ainda precisa de um limite pra não
// virar uma query sem fim se alguém escolher um período gigante.
const MAX_ROWS = 5000

type PeriodField = "emissao" | "vencimento" | "pagamento"
type SortBy = "documento" | "vencimento" | "emissao" | "pagamento"

function startOfUTCMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function endOfUTCMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999))
}

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

  const periodField = (searchParams.get("periodField") as PeriodField) || "vencimento"
  const sortBy = (searchParams.get("sortBy") as SortBy) || "vencimento"
  const status = searchParams.get("status")
  const groupId = searchParams.get("groupId")
  const paymentMethodId = searchParams.get("paymentMethodId")
  const search = searchParams.get("search")?.trim()

  // Se "from"/"to" não vierem, o servidor calcula o mês corrente sozinho —
  // nunca confia que o cliente vai sempre mandar um período, senão a busca
  // vira "todo o histórico da empresa" sem querer.
  const now = new Date()
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const from = fromParam ? new Date(fromParam) : startOfUTCMonth(now)
  const to = toParam ? new Date(toParam) : endOfUTCMonth(now)
  // "to" cobre o dia inteiro (23:59:59.999) — necessário pro período de
  // Pagamento, já que paidAt é um timestamp de verdade (hora exata em que a
  // parcela foi marcada como paga), diferente de dueDate/issueDate que são
  // datas puras (sempre meia-noite UTC).
  const toEndOfDay = new Date(to)
  toEndOfDay.setUTCHours(23, 59, 59, 999)

  // Cada condição vira uma entrada separada de "AND" em vez de tentar juntar
  // tudo num único objeto por spread condicional — duas condições diferentes
  // podem mirar o mesmo campo (ex: período de Vencimento + status "vencida"
  // mexem os dois em dueDate) ou a mesma relação (ex: período de Emissão +
  // busca por texto mexem os dois em "payable"), e juntar isso em um objeto só
  // faria uma sobrescrever a outra silenciosamente (spread só faz merge raso).
  const conditions: Record<string, unknown>[] = []

  if (periodField === "vencimento") {
    conditions.push({ dueDate: { gte: from, lte: toEndOfDay } })
  } else if (periodField === "pagamento") {
    conditions.push({ paidAt: { gte: from, lte: toEndOfDay } })
  } else {
    conditions.push({ payable: { issueDate: { gte: from, lte: toEndOfDay } } })
  }

  if (groupId && groupId !== "todos") conditions.push({ groupId })
  if (paymentMethodId && paymentMethodId !== "todos") conditions.push({ paymentMethodId })

  if (search) {
    conditions.push({
      payable: {
        OR: [
          { payeeName: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      },
    })
  }

  if (status === "pago") {
    conditions.push({ status: "pago" as const })
  } else if (status === "pendente" || status === "vencida") {
    // "Vencida" não é um status próprio no banco — é "pendente" com dueDate no
    // passado, corte em meia-noite UTC (mesma regra de payables/route.ts).
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)
    conditions.push({ status: "pendente" as const })
    conditions.push({ dueDate: status === "vencida" ? { lt: startOfToday } : { gte: startOfToday } })
  }

  const where = { companyId, AND: conditions }

  const orderBy =
    sortBy === "pagamento"
      ? { paidAt: "asc" as const }
      : sortBy === "documento"
        ? { documentNumber: "asc" as const }
        : sortBy === "emissao"
          ? { payable: { issueDate: "asc" as const } }
          : { dueDate: "asc" as const }

  const installments = await prisma.payableInstallment.findMany({
    where,
    orderBy,
    take: MAX_ROWS + 1,
    include: {
      paymentMethod: { select: { id: true, name: true, isActive: true } },
      group: { select: { id: true, name: true, isActive: true } },
      payable: { select: { id: true, payeeName: true, description: true, issueDate: true } },
    },
  })

  const truncated = installments.length > MAX_ROWS
  const rows = installments.slice(0, MAX_ROWS).map((inst) => ({
    id: inst.id,
    installmentNumber: inst.installmentNumber,
    amount: inst.amount,
    dueDate: inst.dueDate,
    status: inst.status,
    paidAt: inst.paidAt,
    documentNumber: inst.documentNumber,
    paymentMethod: inst.paymentMethod,
    group: inst.group,
    payable: inst.payable,
  }))

  return NextResponse.json({
    rows,
    count: rows.length,
    truncated,
    generatedAt: new Date().toISOString(),
  })
}
