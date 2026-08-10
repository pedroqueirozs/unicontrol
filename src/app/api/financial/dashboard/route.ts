import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminLevel } from "@/lib/roles"

// Painel do Financeiro: totais consolidados + por grupo, todos lidos direto de
// PayableInstallment (companyId/groupId denormalizados ali — ver schema.prisma)
// pra não precisar de join com Payable em nenhuma dessas agregações.
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
  const days = Math.min(365, Math.max(1, Number(searchParams.get("days")) || 5))

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const windowEnd = new Date(today)
  windowEnd.setUTCDate(windowEnd.getUTCDate() + days)

  const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
  const startOfNextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1))

  const [
    dueInWindow,
    overdue,
    paidThisMonth,
    openTotal,
    groups,
    dueInWindowByGroup,
    overdueByGroup,
    upcoming,
  ] = await Promise.all([
    prisma.payableInstallment.aggregate({
      where: { companyId, status: "pendente", dueDate: { gte: today, lte: windowEnd } },
      _sum: { amount: true },
    }),
    prisma.payableInstallment.aggregate({
      where: { companyId, status: "pendente", dueDate: { lt: today } },
      _sum: { amount: true },
    }),
    prisma.payableInstallment.aggregate({
      where: { companyId, status: "pago", paidAt: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
    }),
    prisma.payableInstallment.aggregate({
      where: { companyId, status: "pendente" },
      _sum: { amount: true },
    }),
    prisma.payableGroup.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.payableInstallment.groupBy({
      by: ["groupId"],
      where: { companyId, status: "pendente", dueDate: { gte: today, lte: windowEnd } },
      _sum: { amount: true },
    }),
    prisma.payableInstallment.groupBy({
      by: ["groupId"],
      where: { companyId, status: "pendente", dueDate: { lt: today } },
      _sum: { amount: true },
    }),
    prisma.payableInstallment.findMany({
      where: { companyId, status: "pendente" },
      orderBy: { dueDate: "asc" },
      take: 10,
      include: {
        payable: { select: { payeeName: true, description: true } },
        group: { select: { name: true } },
        paymentMethod: { select: { name: true } },
      },
    }),
  ])

  const byGroup = groups
    .map((g) => {
      const due = dueInWindowByGroup.find((d) => d.groupId === g.id)
      const overdueG = overdueByGroup.find((d) => d.groupId === g.id)
      return {
        groupId: g.id,
        groupName: g.name,
        dueInWindow: Number(due?._sum.amount ?? 0),
        overdueAmount: Number(overdueG?._sum.amount ?? 0),
      }
    })
    .sort((a, b) => b.overdueAmount - a.overdueAmount || b.dueInWindow - a.dueInWindow)

  return NextResponse.json({
    days,
    totals: {
      dueInWindow: Number(dueInWindow._sum.amount ?? 0),
      overdue: Number(overdue._sum.amount ?? 0),
      paidThisMonth: Number(paidThisMonth._sum.amount ?? 0),
      openTotal: Number(openTotal._sum.amount ?? 0),
    },
    byGroup,
    upcoming: upcoming.map((i) => ({
      id: i.id,
      payeeName: i.payable.payeeName,
      description: i.payable.description,
      groupName: i.group.name,
      amount: Number(i.amount),
      dueDate: i.dueDate,
      paymentMethodName: i.paymentMethod.name,
    })),
  })
}
