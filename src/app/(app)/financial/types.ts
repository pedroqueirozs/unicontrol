export type PayableGroupRef = {
  id: string
  name: string
  isActive: boolean
}

export type PaymentMethodRef = {
  id: string
  name: string
  isActive: boolean
}

export type SupplierRef = {
  id: string
  name: string
  code: string
  cnpj: string
}

export type PayableInstallment = {
  id: string
  installmentNumber: number
  amount: string
  dueDate: string
  status: "pendente" | "pago"
  paidAt: string | null
  paymentMethodId: string
  paymentMethod?: PaymentMethodRef
  documentNumber: string | null
}

export type Payable = {
  id: string
  payeeName: string
  description: string
  totalAmount: string
  issueDate: string | null
  supplierId: string | null
  groupId: string
  group?: { id: string; name: string }
  createdByName: string
  createdAt: string
  installments: PayableInstallment[]
}

// Uma linha da listagem de Lançamentos (paginada no servidor, por parcela) —
// traz só o resumo do lançamento dono da parcela, não todas as parcelas dele.
// Pra editar ou ver o detalhe completo, busca o Payable inteiro por id.
export type PayableInstallmentRow = {
  id: string
  installmentNumber: number
  amount: string
  dueDate: string
  status: "pendente" | "pago"
  paidAt: string | null
  documentNumber: string | null
  paymentMethodId: string
  paymentMethod?: PaymentMethodRef
  payable: {
    id: string
    payeeName: string
    description: string
    createdAt: string
    groupId: string
    group: { id: string; name: string } | null
    installmentsCount: number
  }
}
