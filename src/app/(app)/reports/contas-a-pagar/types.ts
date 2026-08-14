import type { PayableGroupRef, PaymentMethodRef } from "../../financial/types"

export type PeriodField = "emissao" | "vencimento" | "pagamento"
export type ReportSortBy = "documento" | "vencimento" | "emissao" | "pagamento"
export type ReportGroupBy = "nenhum" | "vencimento" | "grupo" | "fornecedor" | "forma"
export type ReportStatusFilter = "todas" | "pendente" | "vencida" | "pago"

export type PayableReportRow = {
  id: string
  installmentNumber: number
  amount: string
  dueDate: string
  status: "pendente" | "pago"
  paidAt: string | null
  documentNumber: string | null
  paymentMethod: PaymentMethodRef | null
  group: PayableGroupRef | null
  payable: {
    id: string
    payeeName: string
    description: string
    issueDate: string | null
  }
}

export type PayableReportResponse = {
  rows: PayableReportRow[]
  count: number
  truncated: boolean
  generatedAt: string
}
