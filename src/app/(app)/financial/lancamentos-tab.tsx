"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, CheckCircle2, Undo2, Receipt, AlertCircle, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { PayableForm, type PayableFormData } from "./payable-form"
import { PayableDetailModal } from "./payable-detail-modal"
import { currency, formatDate, formatDateTime, installmentStatus, StatusBadge } from "./format"
import type { Payable, PayableGroupRef, PaymentMethodRef, SupplierRef, PayableInstallmentRow } from "./types"

type StatusFilter = "todas" | "pendente" | "vencida" | "pago"
type ConfirmDeleteTarget = { id: string; payeeName: string; description: string; installmentsCount: number }

const PAGE_SIZE = 50

export function LancamentosTab() {
  // Dados de referência (grupos, formas de pagamento, fornecedores) — usados
  // pelo formulário e pelo filtro de grupo, carregados uma vez só.
  const [groups, setGroups] = useState<PayableGroupRef[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRef[]>([])
  const [suppliers, setSuppliers] = useState<SupplierRef[]>([])
  const [staticLoading, setStaticLoading] = useState(true)

  // Lista de lançamentos (uma linha por parcela) — paginada e filtrada no
  // servidor, já que a tabela de parcelas tem companyId/grupo/status/vencimento
  // denormalizados com índice pra isso.
  const [rows, setRows] = useState<PayableInstallmentRow[]>([])
  const [total, setTotal] = useState(0)
  const [rowsLoading, setRowsLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Payable | null>(null)
  const [saving, setSaving] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteTarget | null>(null)
  const [detailPayable, setDetailPayable] = useState<Payable | null>(null)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas")
  const [groupFilter, setGroupFilter] = useState<string>("todos")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const loadStatic = useCallback(async () => {
    try {
      const [groupsRes, methodsRes, suppliersRes] = await Promise.all([
        fetch("/api/financial/groups"),
        fetch("/api/financial/payment-methods"),
        fetch("/api/suppliers"),
      ])
      if (!groupsRes.ok || !methodsRes.ok || !suppliersRes.ok) throw new Error()
      setGroups(await groupsRes.json())
      setPaymentMethods(await methodsRes.json())
      setSuppliers(await suppliersRes.json())
    } catch {
      toast.error("Erro ao carregar dados auxiliares.")
    } finally {
      setStaticLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatic()
  }, [loadStatic])

  const load = useCallback(async () => {
    setRowsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (statusFilter !== "todas") params.set("status", statusFilter)
      if (groupFilter !== "todos") params.set("groupId", groupFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)
      const res = await fetch(`/api/financial/payables?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRows(data.rows)
      setTotal(data.total)
    } catch {
      toast.error("Erro ao carregar lançamentos.")
    } finally {
      setRowsLoading(false)
    }
  }, [page, statusFilter, groupFilter, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  // Busca por texto dispara uma requisição nova — espera o usuário parar de
  // digitar por 300ms antes de refazer a chamada, pra não bater na API a
  // cada tecla.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleStatusFilterChange(next: StatusFilter) {
    setStatusFilter(next)
    setPage(1)
  }

  function handleGroupFilterChange(next: string) {
    setGroupFilter(next)
    setPage(1)
  }

  function openCreate() {
    setEditItem(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditItem(null)
  }

  async function fetchFullPayable(id: string): Promise<Payable | null> {
    try {
      const res = await fetch(`/api/financial/payables/${id}`)
      if (!res.ok) throw new Error()
      return await res.json()
    } catch {
      toast.error("Erro ao carregar o lançamento.")
      return null
    }
  }

  // A listagem só traz o resumo do lançamento de cada parcela (não as outras
  // parcelas dele) — editar ou ver o detalhe completo busca o registro
  // inteiro por id. Quando o lançamento já está carregado por inteiro (vindo
  // do próprio modal de detalhe), não precisa buscar de novo.
  async function openEditById(payableId: string) {
    if (openingId) return
    setOpeningId(payableId)
    const full = await fetchFullPayable(payableId)
    setOpeningId(null)
    if (full) {
      setEditItem(full)
      setShowForm(true)
    }
  }

  function openEditFull(payable: Payable) {
    setEditItem(payable)
    setShowForm(true)
  }

  async function openDetail(payableId: string) {
    if (openingId) return
    setOpeningId(payableId)
    const full = await fetchFullPayable(payableId)
    setOpeningId(null)
    if (full) setDetailPayable(full)
  }

  async function handleSave(data: PayableFormData) {
    setSaving(true)
    try {
      const payload = {
        groupId: data.groupId,
        supplierId: data.supplierId,
        payeeName: data.payeeName,
        description: data.description,
        issueDate: data.issueDate || null,
        totalAmount: data.totalAmount,
        installments: data.installments.map((i) => ({
          id: i.id,
          amount: i.amount,
          dueDate: i.dueDate,
          paymentMethodId: i.paymentMethodId,
          documentNumber: i.documentNumber,
        })),
      }

      const res = editItem
        ? await fetch(`/api/financial/payables/${editItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/financial/payables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error ?? "Erro ao salvar lançamento.")
        return
      }

      await load()
      closeForm()
      toast.success(editItem ? "Lançamento atualizado." : "Lançamento cadastrado.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(target: ConfirmDeleteTarget) {
    try {
      const res = await fetch(`/api/financial/payables/${target.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setConfirmDelete(null)
      await load()
      toast.success("Lançamento removido.")
    } catch {
      toast.error("Erro ao remover lançamento.")
    }
  }

  async function handleTogglePaid(installment: { id: string; status: "pendente" | "pago" }) {
    const next = installment.status === "pago" ? "pendente" : "pago"
    try {
      const res = await fetch(`/api/financial/installments/${installment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, paidAt: next === "pago" ? new Date().toISOString() : undefined }),
      })
      if (!res.ok) throw new Error()
      const updated: { id: string; status: "pendente" | "pago"; paidAt: string | null } = await res.json()
      // O modal de detalhe guarda sua própria cópia do lançamento (aberta ao
      // clicar na linha) — sem isso, marcar como pago ali só refletia depois
      // de fechar e reabrir o modal.
      setDetailPayable((prev) =>
        prev
          ? {
              ...prev,
              installments: prev.installments.map((i) =>
                i.id === updated.id ? { ...i, status: updated.status, paidAt: updated.paidAt } : i
              ),
            }
          : prev
      )
      // A lista recarrega da API (em vez de só trocar o status localmente)
      // porque o filtro por status agora é feito no servidor — se a aba
      // ativa for "Pendentes", por exemplo, a parcela paga precisa sumir dela.
      await load()
      toast.success(next === "pago" ? "Parcela marcada como paga." : "Parcela voltou a pendente.")
    } catch {
      toast.error("Erro ao atualizar parcela.")
    }
  }

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "pendente", label: "Pendentes" },
    { key: "vencida", label: "Vencidas" },
    { key: "pago", label: "Pagas" },
  ]

  if (staticLoading) {
    return <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Carregando...</div>
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header + filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusFilterChange(tab.key)}
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
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity min-h-[44px]"
          >
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={groupFilter}
            onChange={(e) => handleGroupFilterChange(e.target.value)}
            className="h-11 w-full sm:w-64 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
          >
            <option value="todos">Todos os grupos</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <div className="relative flex-1 sm:max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por descrição ou fornecedor/nome..."
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
      </div>

      {/* Form inline */}
      {showForm && (
        <PayableForm
          groups={groups}
          paymentMethods={paymentMethods}
          suppliers={suppliers}
          editItem={editItem}
          onSave={handleSave}
          onCancel={closeForm}
          saving={saving}
        />
      )}

      {/* Lista */}
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
          {debouncedSearch ? (
            <p>Nenhum lançamento encontrado para <strong className="text-foreground">&ldquo;{debouncedSearch}&rdquo;</strong>.</p>
          ) : (
            <p>Nenhum lançamento encontrado.</p>
          )}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Descrição</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Grupo</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Lançado em</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Parcela</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Vencimento</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Valor</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Forma</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => openDetail(row.payable.id)}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                      openingId === row.payable.id ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.payable.payeeName}</p>
                      <p className="text-xs text-muted-foreground">{row.payable.description}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.payable.group?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(row.payable.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.installmentNumber}/{row.payable.installmentsCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(row.dueDate)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{currency(row.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.paymentMethod?.name ?? "—"}
                      {row.documentNumber && (
                        <p className="text-xs text-muted-foreground/70">Doc: {row.documentNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={installmentStatus(row)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePaid(row) }}
                          className={`p-2 rounded-lg transition-colors ${
                            row.status === "pago"
                              ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                              : "text-muted-foreground hover:text-details-green hover:bg-details-green/10"
                          }`}
                          title={row.status === "pago" ? "Desfazer pagamento" : "Marcar como pago"}
                        >
                          {row.status === "pago" ? <Undo2 size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditById(row.payable.id) }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Editar lançamento"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDelete({
                              id: row.payable.id,
                              payeeName: row.payable.payeeName,
                              description: row.payable.description,
                              installmentsCount: row.payable.installmentsCount,
                            })
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {rows.map((row) => (
              <div
                key={row.id}
                onClick={() => openDetail(row.payable.id)}
                className={`rounded-xl border border-border bg-card p-4 flex flex-col gap-3 cursor-pointer ${
                  openingId === row.payable.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">{row.payable.payeeName}</p>
                    <p className="text-xs text-muted-foreground">{row.payable.description}</p>
                  </div>
                  <StatusBadge status={installmentStatus(row)} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{row.payable.group?.name ?? "—"}</span>
                  <span>Parcela {row.installmentNumber}/{row.payable.installmentsCount}</span>
                  <span>Vence {formatDate(row.dueDate)}</span>
                  <span>{row.paymentMethod?.name ?? "—"}</span>
                  {row.documentNumber && <span>Doc: {row.documentNumber}</span>}
                  <span>Lançado em {formatDateTime(row.payable.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">{currency(row.amount)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePaid(row) }}
                      className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${
                        row.status === "pago"
                          ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                          : "text-muted-foreground hover:text-details-green hover:bg-details-green/10"
                      }`}
                    >
                      {row.status === "pago" ? <Undo2 size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditById(row.payable.id) }}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDelete({
                          id: row.payable.id,
                          payeeName: row.payable.payeeName,
                          description: row.payable.description,
                          installmentsCount: row.payable.installmentsCount,
                        })
                      }}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-border hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 text-sm font-medium text-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-border hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card w-full md:max-w-sm md:rounded-2xl rounded-t-2xl shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Excluir lançamento?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong className="text-foreground">{confirmDelete.payeeName}</strong> — {confirmDelete.description} —
                  todas as {confirmDelete.installmentsCount} parcela(s) serão removidas, mesmo as já pagas.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-white text-sm font-medium hover:opacity-90 transition min-h-[44px]"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-lg border border-border text-foreground text-sm hover:bg-muted transition min-h-[44px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalhe do lançamento — todas as parcelas, não só a clicada */}
      <PayableDetailModal
        payable={detailPayable}
        onClose={() => setDetailPayable(null)}
        onEdit={(payable) => { setDetailPayable(null); openEditFull(payable) }}
        onTogglePaid={handleTogglePaid}
      />
    </div>
  )
}
