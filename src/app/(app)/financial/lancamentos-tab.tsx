"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, CheckCircle2, Undo2, Receipt, AlertCircle, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { PayableForm, type PayableFormData } from "./payable-form"
import { PayableDetailModal } from "./payable-detail-modal"
import { currency, formatDate, formatDateTime, installmentStatus, StatusBadge } from "./format"
import type { Payable, PayableInstallment, PayableGroupRef, PaymentMethodRef, SupplierRef } from "./types"

type StatusFilter = "todas" | "pendente" | "vencida" | "pago"

const PAGE_SIZE = 50

type Row = { payable: Payable; installment: PayableInstallment }

export function LancamentosTab() {
  const [payables, setPayables] = useState<Payable[]>([])
  const [groups, setGroups] = useState<PayableGroupRef[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRef[]>([])
  const [suppliers, setSuppliers] = useState<SupplierRef[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Payable | null>(null)
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState<Payable | null>(null)
  const [detailPayable, setDetailPayable] = useState<Payable | null>(null)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas")
  const [groupFilter, setGroupFilter] = useState<string>("todos")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [payablesRes, groupsRes, methodsRes, suppliersRes] = await Promise.all([
        fetch("/api/financial/payables"),
        fetch("/api/financial/groups"),
        fetch("/api/financial/payment-methods"),
        fetch("/api/suppliers"),
      ])
      if (!payablesRes.ok || !groupsRes.ok || !methodsRes.ok || !suppliersRes.ok) throw new Error()
      setPayables(await payablesRes.json())
      setGroups(await groupsRes.json())
      setPaymentMethods(await methodsRes.json())
      setSuppliers(await suppliersRes.json())
    } catch {
      toast.error("Erro ao carregar os dados.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const rows: Row[] = useMemo(() => {
    const all: Row[] = []
    for (const payable of payables) {
      for (const installment of payable.installments) {
        all.push({ payable, installment })
      }
    }
    const searchTrimmed = search.trim().toLowerCase()
    return all
      .filter((r) => groupFilter === "todos" || r.payable.groupId === groupFilter)
      .filter((r) => statusFilter === "todas" || installmentStatus(r.installment) === statusFilter)
      .filter(
        (r) =>
          !searchTrimmed ||
          r.payable.payeeName.toLowerCase().includes(searchTrimmed) ||
          r.payable.description.toLowerCase().includes(searchTrimmed)
      )
      .sort((a, b) => new Date(a.installment.dueDate).getTime() - new Date(b.installment.dueDate).getTime())
  }, [payables, groupFilter, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleStatusFilterChange(next: StatusFilter) {
    setStatusFilter(next)
    setPage(1)
  }

  function handleGroupFilterChange(next: string) {
    setGroupFilter(next)
    setPage(1)
  }

  function handleSearchChange(next: string) {
    setSearch(next)
    setPage(1)
  }

  function openCreate() {
    setEditItem(null)
    setShowForm(true)
  }

  function openEdit(payable: Payable) {
    setEditItem(payable)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditItem(null)
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

      await loadData()
      closeForm()
      toast.success(editItem ? "Lançamento atualizado." : "Lançamento cadastrado.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(payable: Payable) {
    try {
      const res = await fetch(`/api/financial/payables/${payable.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setPayables((prev) => prev.filter((p) => p.id !== payable.id))
      setConfirmDelete(null)
      toast.success("Lançamento removido.")
    } catch {
      toast.error("Erro ao remover lançamento.")
    }
  }

  async function handleTogglePaid(installment: PayableInstallment) {
    const next = installment.status === "pago" ? "pendente" : "pago"
    try {
      const res = await fetch(`/api/financial/installments/${installment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, paidAt: next === "pago" ? new Date().toISOString() : undefined }),
      })
      if (!res.ok) throw new Error()
      const updated: PayableInstallment = await res.json()
      // Merge só de status/paidAt — a resposta do PATCH não inclui a relação
      // paymentMethod, então substituir o objeto inteiro apagaria esse dado da tela.
      setPayables((prev) =>
        prev.map((p) => ({
          ...p,
          installments: p.installments.map((i) =>
            i.id === updated.id ? { ...i, status: updated.status, paidAt: updated.paidAt } : i
          ),
        }))
      )
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

  if (loading) {
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
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por descrição ou fornecedor/nome..."
              className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-background text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
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
      {rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Receipt size={40} className="mx-auto mb-2 opacity-30" />
          {search ? (
            <p>Nenhum lançamento encontrado para <strong className="text-foreground">&ldquo;{search}&rdquo;</strong>.</p>
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
                {paginated.map(({ payable, installment }) => (
                  <tr
                    key={installment.id}
                    onClick={() => setDetailPayable(payable)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{payable.payeeName}</p>
                      <p className="text-xs text-muted-foreground">{payable.description}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{payable.group?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(payable.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {installment.installmentNumber}/{payable.installments.length}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(installment.dueDate)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{currency(installment.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {installment.paymentMethod?.name ?? "—"}
                      {installment.documentNumber && (
                        <p className="text-xs text-muted-foreground/70">Doc: {installment.documentNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={installmentStatus(installment)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePaid(installment) }}
                          className={`p-2 rounded-lg transition-colors ${
                            installment.status === "pago"
                              ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                              : "text-muted-foreground hover:text-details-green hover:bg-details-green/10"
                          }`}
                          title={installment.status === "pago" ? "Desfazer pagamento" : "Marcar como pago"}
                        >
                          {installment.status === "pago" ? <Undo2 size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(payable) }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Editar lançamento"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(payable) }}
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
            {paginated.map(({ payable, installment }) => (
              <div
                key={installment.id}
                onClick={() => setDetailPayable(payable)}
                className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">{payable.payeeName}</p>
                    <p className="text-xs text-muted-foreground">{payable.description}</p>
                  </div>
                  <StatusBadge status={installmentStatus(installment)} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{payable.group?.name ?? "—"}</span>
                  <span>Parcela {installment.installmentNumber}/{payable.installments.length}</span>
                  <span>Vence {formatDate(installment.dueDate)}</span>
                  <span>{installment.paymentMethod?.name ?? "—"}</span>
                  {installment.documentNumber && <span>Doc: {installment.documentNumber}</span>}
                  <span>Lançado em {formatDateTime(payable.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">{currency(installment.amount)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePaid(installment) }}
                      className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${
                        installment.status === "pago"
                          ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                          : "text-muted-foreground hover:text-details-green hover:bg-details-green/10"
                      }`}
                    >
                      {installment.status === "pago" ? <Undo2 size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(payable) }}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(payable) }}
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
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, rows.length)} de {rows.length} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-border hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 text-sm font-medium text-foreground">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
                  todas as {confirmDelete.installments.length} parcela(s) serão removidas, mesmo as já pagas.
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
        onEdit={(payable) => { setDetailPayable(null); openEdit(payable) }}
        onTogglePaid={handleTogglePaid}
      />
    </div>
  )
}
