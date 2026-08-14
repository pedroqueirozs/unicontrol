"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Search, X, AlertTriangle, Receipt, Printer } from "lucide-react"
import { currency, formatDate, formatDateTime, installmentStatus, StatusBadge } from "../../financial/format"
import type { PayableGroupRef, PaymentMethodRef } from "../../financial/types"
import type {
  PayableReportRow,
  PeriodField,
  ReportGroupBy,
  ReportSortBy,
  ReportStatusFilter,
} from "./types"

const selectClass =
  "h-11 w-full rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"

const STATUS_TABS: { key: ReportStatusFilter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendente", label: "Pendentes" },
  { key: "vencida", label: "Vencidas" },
  { key: "pago", label: "Pagas" },
]

const PERIOD_LABELS: Record<PeriodField, string> = {
  vencimento: "Vencimento",
  emissao: "Emissão",
  pagamento: "Pagamento",
}

const SORT_LABELS: Record<ReportSortBy, string> = {
  vencimento: "Vencimento",
  emissao: "Emissão",
  pagamento: "Pagamento",
  documento: "Documento",
}

const GROUP_LABELS: Record<ReportGroupBy, string> = {
  nenhum: "Nenhum",
  vencimento: "Vencimento",
  grupo: "Grupo",
  fornecedor: "Fornecedor",
  forma: "Forma de Pagamento",
}

// Datas em UTC pra bater exatamente com o default que a API calcula sozinha
// quando "from"/"to" não vêm — evita a tela pré-selecionar um mês diferente
// do que o servidor usaria se os campos chegassem vazios.
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}
function defaultFrom() {
  const now = new Date()
  return isoDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)))
}
function defaultTo() {
  const now = new Date()
  return isoDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)))
}

type Bucket = { key: string; label: string; rows: PayableReportRow[]; subtotal: number }

function groupRows(rows: PayableReportRow[], groupBy: ReportGroupBy): Bucket[] | null {
  if (groupBy === "nenhum") return null

  const buckets = new Map<string, Bucket>()
  for (const row of rows) {
    let key: string
    let label: string
    if (groupBy === "vencimento") {
      key = row.dueDate.slice(0, 10)
      label = formatDate(row.dueDate)
    } else if (groupBy === "grupo") {
      key = row.group?.id ?? "sem-grupo"
      label = row.group?.name ?? "Sem grupo"
    } else if (groupBy === "fornecedor") {
      key = row.payable.payeeName || "sem-nome"
      label = row.payable.payeeName || "Sem nome"
    } else {
      key = row.paymentMethod?.id ?? "sem-forma"
      label = row.paymentMethod?.name ?? "Sem forma"
    }
    if (!buckets.has(key)) buckets.set(key, { key, label, rows: [], subtotal: 0 })
    const bucket = buckets.get(key)!
    bucket.rows.push(row)
    bucket.subtotal += Number(row.amount)
  }

  const list = [...buckets.values()]
  // Agrupado por vencimento mantém ordem cronológica (a chave já é a data em
  // ISO, então ordena certo por string); os demais ficam em ordem alfabética.
  list.sort((a, b) => a.key.localeCompare(b.key))
  return list
}

// Dados vêm do banco (nome de fornecedor, descrição etc.) — nunca confiar
// neles como HTML puro na hora de montar a janela de impressão.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const PRINT_STATUS_STYLE: Record<"pendente" | "vencida" | "pago", { label: string; bg: string; fg: string }> = {
  pendente: { label: "Pendente", bg: "#e0e7ff", fg: "#4338ca" },
  vencida: { label: "Vencida", bg: "#fee2e2", fg: "#b91c1c" },
  pago: { label: "Pago", bg: "#dcfce7", fg: "#15803d" },
}

function printRowHtml(row: PayableReportRow): string {
  const status = installmentStatus(row)
  const { label, bg, fg } = PRINT_STATUS_STYLE[status]
  return `
    <tr>
      <td>
        <div class="primary">${escapeHtml(row.payable.payeeName)}</div>
        <div class="secondary">${escapeHtml(row.payable.description)}</div>
      </td>
      <td>${row.group ? escapeHtml(row.group.name) : "—"}</td>
      <td>${row.payable.issueDate ? formatDate(row.payable.issueDate) : "—"}</td>
      <td>${formatDate(row.dueDate)}</td>
      <td>${row.paidAt ? formatDate(row.paidAt) : "—"}</td>
      <td class="amount">${currency(row.amount)}</td>
      <td>
        ${row.paymentMethod ? escapeHtml(row.paymentMethod.name) : "—"}
        ${row.documentNumber ? `<div class="secondary">Doc: ${escapeHtml(row.documentNumber)}</div>` : ""}
      </td>
      <td><span class="badge" style="background:${bg};color:${fg}">${label}</span></td>
    </tr>
  `
}

function printTableHtml(rows: PayableReportRow[]): string {
  return `
    <table>
      <thead>
        <tr>
          <th>Fornecedor</th>
          <th>Grupo</th>
          <th>Emissão</th>
          <th>Vencimento</th>
          <th>Pagamento</th>
          <th class="amount">Valor</th>
          <th>Forma / Doc.</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows.map(printRowHtml).join("")}</tbody>
    </table>
  `
}

function ReportRowsList({ rows }: { rows: PayableReportRow[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Fornecedor</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Grupo</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Emissão</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Vencimento</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Pagamento</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Valor</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Forma / Doc.</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{row.payable.payeeName}</p>
                  <p className="text-xs text-muted-foreground">{row.payable.description}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.group ? `${row.group.name}${!row.group.isActive ? " (inativo)" : ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.payable.issueDate ? formatDate(row.payable.issueDate) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.paidAt ? formatDate(row.paidAt) : "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(row.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.paymentMethod ? `${row.paymentMethod.name}${!row.paymentMethod.isActive ? " (inativo)" : ""}` : "—"}
                  {row.documentNumber && (
                    <p className="text-xs text-muted-foreground/70">Doc: {row.documentNumber}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={installmentStatus(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground text-sm">{row.payable.payeeName}</p>
                <p className="text-xs text-muted-foreground">{row.payable.description}</p>
              </div>
              <StatusBadge status={installmentStatus(row)} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{row.group ? `${row.group.name}${!row.group.isActive ? " (inativo)" : ""}` : "Sem grupo"}</span>
              <span>Vence {formatDate(row.dueDate)}</span>
              {row.payable.issueDate && <span>Emitido {formatDate(row.payable.issueDate)}</span>}
              {row.paidAt && <span>Pago {formatDate(row.paidAt)}</span>}
              <span>{row.paymentMethod ? `${row.paymentMethod.name}${!row.paymentMethod.isActive ? " (inativo)" : ""}` : "Sem forma"}</span>
              {row.documentNumber && <span>Doc: {row.documentNumber}</span>}
            </div>
            <span className="text-lg font-bold text-foreground">{currency(row.amount)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export function ContasAPagarReport() {
  const [groups, setGroups] = useState<PayableGroupRef[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRef[]>([])
  const [staticLoading, setStaticLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("todas")
  const [periodField, setPeriodField] = useState<PeriodField>("vencimento")
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [groupFilter, setGroupFilter] = useState("todos")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("todos")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState<ReportSortBy>("vencimento")
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("nenhum")

  const [rows, setRows] = useState<PayableReportRow[]>([])
  const [truncated, setTruncated] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [rowsLoading, setRowsLoading] = useState(true)

  useEffect(() => {
    async function loadStatic() {
      try {
        const [groupsRes, methodsRes] = await Promise.all([
          fetch("/api/financial/groups"),
          fetch("/api/financial/payment-methods"),
        ])
        if (!groupsRes.ok || !methodsRes.ok) throw new Error()
        setGroups(await groupsRes.json())
        setPaymentMethods(await methodsRes.json())
      } catch {
        toast.error("Erro ao carregar dados auxiliares.")
      } finally {
        setStaticLoading(false)
      }
    }
    loadStatic()
  }, [])

  const load = useCallback(async (signal?: AbortSignal) => {
    setRowsLoading(true)
    try {
      const params = new URLSearchParams({ periodField, sortBy })
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      if (statusFilter !== "todas") params.set("status", statusFilter)
      if (groupFilter !== "todos") params.set("groupId", groupFilter)
      if (paymentMethodFilter !== "todos") params.set("paymentMethodId", paymentMethodFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)

      const res = await fetch(`/api/financial/reports/payables?${params}`, { signal })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRows(data.rows)
      setTruncated(data.truncated)
      setGeneratedAt(data.generatedAt)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      toast.error("Erro ao carregar o relatório.")
    } finally {
      if (!signal?.aborted) setRowsLoading(false)
    }
  }, [periodField, from, to, statusFilter, groupFilter, paymentMethodFilter, debouncedSearch, sortBy])

  useEffect(() => {
    // Cancela a busca anterior sempre que os filtros mudam de novo antes dela
    // terminar — sem isso, uma resposta antiga (ex: sem o filtro de grupo
    // aplicado) pode chegar depois da mais nova e sobrescrever o resultado
    // certo na tela (mais fácil de acontecer em desenvolvimento, onde o React
    // roda o efeito duas vezes de propósito).
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const summary = useMemo(() => {
    let totalPago = 0
    let totalAberto = 0
    for (const row of rows) {
      const amount = Number(row.amount)
      if (row.status === "pago") totalPago += amount
      else totalAberto += amount
    }
    return { count: rows.length, totalPago, totalAberto, total: totalPago + totalAberto }
  }, [rows])

  const buckets = useMemo(() => groupRows(rows, groupBy), [rows, groupBy])

  function handlePrint() {
    const filterBits = [`${PERIOD_LABELS[periodField]}: ${from ? formatDate(from) : "—"} a ${to ? formatDate(to) : "—"}`]
    if (statusFilter !== "todas") filterBits.push(`Status: ${STATUS_TABS.find((t) => t.key === statusFilter)?.label}`)
    if (groupFilter !== "todos") {
      const g = groups.find((g) => g.id === groupFilter)
      if (g) filterBits.push(`Grupo: ${g.name}`)
    }
    if (paymentMethodFilter !== "todos") {
      const m = paymentMethods.find((m) => m.id === paymentMethodFilter)
      if (m) filterBits.push(`Forma: ${m.name}`)
    }
    if (debouncedSearch) filterBits.push(`Busca: "${debouncedSearch}"`)

    const bodyHtml = buckets
      ? buckets
          .map(
            (b) => `
              <h2 class="group-title">
                ${escapeHtml(b.label)}
                <span class="group-count">(${b.rows.length})</span>
                <span class="group-subtotal">${currency(b.subtotal)}</span>
              </h2>
              ${printTableHtml(b.rows)}
            `
          )
          .join("")
      : printTableHtml(rows)

    const win = window.open("", "_blank", "width=1000,height=800")
    if (!win) {
      toast.error("O navegador bloqueou a janela de impressão — permita pop-ups pra esse site.")
      return
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Contas a Pagar</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #111; padding: 12mm; }
          h1 { font-size: 18pt; margin-bottom: 2mm; }
          .filters { font-size: 9pt; color: #555; margin-bottom: 6mm; }
          .summary { display: flex; gap: 6mm; margin-bottom: 8mm; }
          .summary div { border: 0.3mm solid #ddd; border-radius: 2mm; padding: 3mm 5mm; flex: 1; }
          .summary span { display: block; font-size: 8pt; color: #666; margin-bottom: 1mm; }
          .summary strong { font-size: 12pt; }
          .group-title { font-size: 11pt; margin: 8mm 0 2mm; padding-bottom: 1.5mm; border-bottom: 0.3mm solid #ccc; display: flex; gap: 4mm; align-items: baseline; }
          .group-count { font-weight: normal; color: #777; font-size: 9pt; }
          .group-subtotal { margin-left: auto; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 4mm; }
          thead { display: table-header-group; }
          th, td { border-bottom: 0.2mm solid #e5e5e5; padding: 2mm 2mm; text-align: left; vertical-align: top; }
          th { background: #f5f5f5; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.02em; }
          tr { break-inside: avoid; }
          .primary { font-weight: 600; }
          .secondary { color: #777; font-size: 7.5pt; }
          .amount { text-align: right; font-weight: 600; white-space: nowrap; }
          .badge { display: inline-block; padding: 0.8mm 2.5mm; border-radius: 9999px; font-size: 7.5pt; font-weight: 600; }
          .footer { margin-top: 6mm; font-size: 8pt; color: #999; text-align: right; }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        <h1>Relatório de Contas a Pagar</h1>
        <p class="filters">${escapeHtml(filterBits.join(" · "))}</p>
        <div class="summary">
          <div><span>Títulos</span><strong>${summary.count}</strong></div>
          <div><span>Total do período</span><strong>${currency(summary.total)}</strong></div>
          <div><span>Total pago</span><strong>${currency(summary.totalPago)}</strong></div>
          <div><span>Total em aberto</span><strong>${currency(summary.totalAberto)}</strong></div>
        </div>
        ${bodyHtml}
        <p class="footer">Gerado em ${formatDateTime(generatedAt ?? new Date().toISOString())}</p>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `)
    win.document.close()
  }

  if (staticLoading) {
    return <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Carregando...</div>
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Receipt size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Relatório de Contas a Pagar</h1>
        </div>
        <button
          onClick={handlePrint}
          disabled={rowsLoading || rows.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer size={16} /> Imprimir
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition min-h-[44px] ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Período por</label>
            <select value={periodField} onChange={(e) => setPeriodField(e.target.value as PeriodField)} className={selectClass}>
              {(Object.keys(PERIOD_LABELS) as PeriodField[]).map((key) => (
                <option key={key} value={key}>{PERIOD_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">De</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Até</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Grupo</label>
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className={selectClass}>
              <option value="todos">Todos os grupos</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}{!g.isActive ? " (inativo)" : ""}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Forma de pagamento</label>
            <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} className={selectClass}>
              <option value="todos">Todas as formas</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>{m.name}{!m.isActive ? " (inativo)" : ""}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Buscar (fornecedor/descrição)</label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: aluguel, fornecedor..."
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Agrupar por</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as ReportGroupBy)} className={selectClass}>
              {(Object.keys(GROUP_LABELS) as ReportGroupBy[]).map((key) => (
                <option key={key} value={key}>{GROUP_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as ReportSortBy)} className={selectClass}>
              {(Object.keys(SORT_LABELS) as ReportSortBy[]).map((key) => (
                <option key={key} value={key}>{SORT_LABELS[key]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Títulos</p>
          <p className="text-xl font-bold text-foreground mt-1">{summary.count}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total do período</p>
          <p className="text-xl font-bold text-foreground mt-1">{currency(summary.total)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total pago</p>
          <p className="text-xl font-bold text-details-green mt-1">{currency(summary.totalPago)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total em aberto</p>
          <p className="text-xl font-bold text-primary mt-1">{currency(summary.totalAberto)}</p>
        </div>
      </div>

      {truncated && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle size={16} className="shrink-0" />
          Mostrando os primeiros 5.000 resultados — refine os filtros para ver o total exato.
        </div>
      )}

      {/* Resultado */}
      {rowsLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="h-12 bg-muted/70 border-b border-border" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 border-b border-border last:border-0 bg-muted/30" />
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Receipt size={40} className="mx-auto mb-2 opacity-30" />
          <p>Nenhum lançamento encontrado para esse filtro.</p>
        </div>
      ) : buckets ? (
        <div className="flex flex-col gap-5">
          {buckets.map((bucket) => (
            <div key={bucket.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {bucket.label} <span className="text-muted-foreground font-normal">({bucket.rows.length})</span>
                </h2>
                <span className="text-sm font-semibold text-foreground">{currency(bucket.subtotal)}</span>
              </div>
              <ReportRowsList rows={bucket.rows} />
            </div>
          ))}
        </div>
      ) : (
        <ReportRowsList rows={rows} />
      )}

      {generatedAt && (
        <p className="text-xs text-muted-foreground text-right">Gerado em {formatDateTime(generatedAt)}</p>
      )}
    </div>
  )
}
