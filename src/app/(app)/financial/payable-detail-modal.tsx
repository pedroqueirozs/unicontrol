"use client"

import { X, Pencil, CheckCircle2, Undo2 } from "lucide-react"
import type { Payable, PayableInstallment } from "./types"
import { currency, formatDate, formatDateTime, installmentStatus, StatusBadge } from "./format"

interface Props {
  payable: Payable | null
  onClose: () => void
  onEdit: (payable: Payable) => void
  onTogglePaid: (installment: PayableInstallment) => void
}

export function PayableDetailModal({ payable, onClose, onEdit, onTogglePaid }: Props) {
  if (!payable) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{payable.payeeName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{payable.description}</p>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info + parcelas */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Grupo</p>
              <p className="font-medium text-foreground">{payable.group?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor total</p>
              <p className="font-medium text-foreground">{currency(payable.totalAmount)}</p>
            </div>
            {payable.issueDate && (
              <div>
                <p className="text-xs text-muted-foreground">Data de emissão</p>
                <p className="font-medium text-foreground">{formatDate(payable.issueDate)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Lançado em</p>
              <p className="font-medium text-foreground">{formatDateTime(payable.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cadastrado por</p>
              <p className="font-medium text-foreground">{payable.createdByName}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">
              Parcelas ({payable.installments.length})
            </p>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
              {payable.installments.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {inst.installmentNumber}/{payable.installments.length} · {currency(inst.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Vence {formatDate(inst.dueDate)} · {inst.paymentMethod?.name ?? "—"}
                      {inst.documentNumber && ` · Doc ${inst.documentNumber}`}
                      {inst.paidAt && ` · Pago em ${formatDate(inst.paidAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={installmentStatus(inst)} />
                    <button
                      onClick={() => onTogglePaid(inst)}
                      className={`p-2 rounded-lg transition-colors ${
                        inst.status === "pago"
                          ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                          : "text-muted-foreground hover:text-details-green hover:bg-details-green/10"
                      }`}
                      title={inst.status === "pago" ? "Desfazer pagamento" : "Marcar como pago"}
                    >
                      {inst.status === "pago" ? <Undo2 size={15} /> : <CheckCircle2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition"
          >
            Fechar
          </button>
          <button
            onClick={() => onEdit(payable)}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <Pencil size={15} /> Editar
          </button>
        </div>
      </div>
    </div>
  )
}
