"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Clock, AlertTriangle, CheckCircle2, Wallet, Building2, Receipt, CircleCheck } from "lucide-react"

type DashboardData = {
  days: number
  totals: {
    dueInWindow: number
    overdue: number
    paidThisMonth: number
    openTotal: number
  }
  byGroup: {
    groupId: string
    groupName: string
    dueInWindow: number
    overdueAmount: number
  }[]
  upcoming: {
    id: string
    payeeName: string
    description: string
    groupName: string
    amount: number
    dueDate: string
    paymentMethodName: string
  }[]
}

const DAY_OPTIONS = [5, 7, 15, 30]

function currency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(iso))
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  valueColor,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
  valueColor: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function DashboardTab() {
  const [days, setDays] = useState(5)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)

  const loadData = useCallback(async (selectedDays: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/financial/dashboard?days=${selectedDays}`)
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error("Erro ao carregar o painel.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(days)
  }, [days, loadData])

  async function handleMarkPaid(installmentId: string) {
    setPayingId(installmentId)
    try {
      const res = await fetch(`/api/financial/installments/${installmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pago", paidAt: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error()
      toast.success("Parcela marcada como paga.")
      await loadData(days)
    } catch {
      toast.error("Erro ao atualizar parcela.")
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Seletor de período */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Vencendo em até:</span>
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition min-h-[40px] ${
              days === d
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {d} dias
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading || !data ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              icon={<Clock size={18} />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
              value={currency(data.totals.dueInWindow)}
              label={`Vence em ${data.days} dias`}
              valueColor="text-primary"
            />
            <StatCard
              icon={<AlertTriangle size={18} />}
              iconBg={data.totals.overdue ? "bg-destructive/10" : "bg-details-green/10"}
              iconColor={data.totals.overdue ? "text-destructive" : "text-details-green"}
              value={currency(data.totals.overdue)}
              label="Vencidas"
              valueColor={data.totals.overdue ? "text-destructive" : "text-details-green"}
            />
            <StatCard
              icon={<CheckCircle2 size={18} />}
              iconBg="bg-details-green/10"
              iconColor="text-details-green"
              value={currency(data.totals.paidThisMonth)}
              label="Pago este mês"
              valueColor="text-details-green"
            />
            <StatCard
              icon={<Wallet size={18} />}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
              value={currency(data.totals.openTotal)}
              label="Total em aberto"
              valueColor="text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </div>

      {/* Por grupo */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 size={14} /> Por empresa
        </h2>
        {loading || !data ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : data.byGroup.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum grupo cadastrado ainda.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {data.byGroup.map((g) => (
              <div key={g.groupId} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{g.groupName}</span>
                  {g.overdueAmount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium shrink-0">
                      {currency(g.overdueAmount)} vencido
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {currency(g.dueInWindow)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos vencimentos */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Receipt size={14} /> Próximos vencimentos
        </h2>
        {loading || !data ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : data.upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma parcela pendente.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {data.upcoming.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.payeeName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description} · {item.groupName} · {item.paymentMethodName}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{currency(item.amount)}</p>
                    <p className="text-xs text-muted-foreground">Vence {formatDate(item.dueDate)}</p>
                  </div>
                  <button
                    onClick={() => handleMarkPaid(item.id)}
                    disabled={payingId === item.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-details-green/10 text-details-green hover:bg-details-green/20 transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    <CircleCheck size={14} />
                    Pagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
