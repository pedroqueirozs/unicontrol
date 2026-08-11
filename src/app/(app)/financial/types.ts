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
