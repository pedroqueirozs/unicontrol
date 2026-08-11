"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Search, X, Plus, Trash2, Split } from "lucide-react"
import { FormInput } from "@/components/form-input"
import { CurrencyInput } from "./currency-input"
import type { Payable, PayableGroupRef, PaymentMethodRef, SupplierRef } from "./types"

const installmentSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive("Valor deve ser maior que zero"),
  dueDate: z.string().min(1, "Informe o vencimento"),
  paymentMethodId: z.string().min(1, "Selecione a forma de pagamento"),
  documentNumber: z.string().optional(),
})

// avulso* e (totalAmount/installments) nunca se misturam no mesmo campo — cada
// modo tem seus próprios inputs, e a montagem final acontece só no submit
// (buildPayload). Já tentamos reaproveitar "installments.0.amount" pros dois
// modos e o React Hook Form manteve o onChange do avulso "grudado" mesmo
// depois de trocar pra Parcelado — campos com nomes totalmente distintos
// eliminam esse problema pela raiz.
const rawSchema = z
  .object({
    groupId: z.string().min(1, "Selecione o grupo"),
    supplierId: z.string().nullable(),
    payeeName: z.string().optional(),
    description: z.string().min(1, "Descrição é obrigatória"),
    issueDate: z.string().optional(),
    avulsoAmount: z.number().optional(),
    avulsoDueDate: z.string().optional(),
    avulsoPaymentMethodId: z.string().optional(),
    avulsoDocumentNumber: z.string().optional(),
    totalAmount: z.number().optional(),
    installments: z.array(installmentSchema).optional(),
  })
  .refine((data) => !!data.supplierId || !!data.payeeName?.trim(), {
    message: "Selecione um fornecedor ou informe um nome",
    path: ["payeeName"],
  })

type RawFormData = z.infer<typeof rawSchema>

export type PayableFormData = {
  groupId: string
  supplierId: string | null
  payeeName?: string
  description: string
  issueDate?: string
  totalAmount: number
  installments: z.infer<typeof installmentSchema>[]
}

interface Props {
  groups: PayableGroupRef[]
  paymentMethods: PaymentMethodRef[]
  suppliers: SupplierRef[]
  editItem: Payable | null
  onSave: (data: PayableFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
}

// Divide um valor em N parcelas cujo total bate exatamente com o original,
// jogando o resto (centavos de arredondamento) na última parcela.
function splitAmount(total: number, count: number): number[] {
  const totalCents = Math.round(total * 100)
  const baseCents = Math.floor(totalCents / count)
  const remainder = totalCents - baseCents * count
  return Array.from({ length: count }, (_, i) =>
    (i === count - 1 ? baseCents + remainder : baseCents) / 100
  )
}

function addDays(dateStr: string, days: number): string {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Boleto e cheque têm número de documento físico que vale a pena registrar
// pra conferir contra o relatório na tela depois — as outras formas não.
// Comparação por nome (não por id fixo) porque formas de pagamento são
// cadastro livre do usuário, não um enum fechado.
function needsDocumentNumber(paymentMethods: PaymentMethodRef[], paymentMethodId: string | undefined): boolean {
  const method = paymentMethods.find((m) => m.id === paymentMethodId)
  if (!method) return false
  const name = method.name.trim().toLowerCase()
  return name.includes("boleto") || name.includes("cheque")
}

export function PayableForm({ groups, paymentMethods, suppliers, editItem, onSave, onCancel, saving }: Props) {
  const [mode, setMode] = useState<"avulso" | "parcelado">("avulso")

  // Campos auxiliares só para a divisão automática — não vão pro payload.
  const [installmentCount, setInstallmentCount] = useState(2)
  const [firstDueDate, setFirstDueDate] = useState(todayStr())
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState(paymentMethods[0]?.id ?? "")

  // Busca de fornecedor
  const [supplierSearch, setSupplierSearch] = useState("")
  const [showSupplierDrop, setShowSupplierDrop] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRef | null>(null)
  const supplierSearchRef = useRef<HTMLDivElement>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<RawFormData>({
    resolver: zodResolver(rawSchema),
    defaultValues: {
      groupId: groups[0]?.id ?? "",
      supplierId: null,
      payeeName: "",
      description: "",
      issueDate: "",
      avulsoAmount: 0,
      avulsoDueDate: todayStr(),
      avulsoPaymentMethodId: paymentMethods[0]?.id ?? "",
      avulsoDocumentNumber: "",
      totalAmount: 0,
      installments: [],
    },
  })

  const watchedAvulsoPaymentMethodId = useWatch({ control, name: "avulsoPaymentMethodId" })
  const { fields, replace } = useFieldArray({ control, name: "installments" })
  // installments sempre existe em runtime (defaultValues garante []) — o "| undefined"
  // é só do optional() no schema (necessário pro modo avulso não exigir parcelas).
  const watchedInstallments = useWatch({ control, name: "installments" }) as NonNullable<RawFormData["installments"]>
  const watchedTotal = useWatch({ control, name: "totalAmount" })

  const installmentsSum = useMemo(
    () => watchedInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0),
    [watchedInstallments]
  )
  const sumMatches = Math.abs(installmentsSum - (Number(watchedTotal) || 0)) <= 0.01

  useEffect(() => {
    if (editItem) {
      const isParcelado = editItem.installments.length > 1
      setMode(isParcelado ? "parcelado" : "avulso")
      if (editItem.supplierId) {
        setSelectedSupplier({
          id: editItem.supplierId,
          name: editItem.payeeName,
          code: "",
          cnpj: "",
        })
      } else {
        setSelectedSupplier(null)
      }
      const first = editItem.installments[0]
      reset({
        groupId: editItem.groupId,
        supplierId: editItem.supplierId,
        payeeName: editItem.payeeName,
        description: editItem.description,
        issueDate: editItem.issueDate ? editItem.issueDate.slice(0, 10) : "",
        avulsoAmount: !isParcelado && first ? Number(first.amount) : 0,
        avulsoDueDate: !isParcelado && first ? first.dueDate.slice(0, 10) : todayStr(),
        avulsoPaymentMethodId: !isParcelado && first ? first.paymentMethodId : paymentMethods[0]?.id ?? "",
        avulsoDocumentNumber: !isParcelado && first ? first.documentNumber ?? "" : "",
        totalAmount: Number(editItem.totalAmount),
        installments: editItem.installments.map((inst) => ({
          id: inst.id,
          amount: Number(inst.amount),
          dueDate: inst.dueDate.slice(0, 10),
          paymentMethodId: inst.paymentMethodId,
          documentNumber: inst.documentNumber ?? "",
        })),
      })
    } else {
      setMode("avulso")
      setSelectedSupplier(null)
      setSupplierSearch("")
      reset({
        groupId: groups.find((g) => g.isActive)?.id ?? groups[0]?.id ?? "",
        supplierId: null,
        payeeName: "",
        description: "",
        issueDate: "",
        avulsoAmount: 0,
        avulsoDueDate: todayStr(),
        avulsoPaymentMethodId: paymentMethods.find((m) => m.isActive)?.id ?? "",
        avulsoDocumentNumber: "",
        totalAmount: 0,
        installments: [],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem])

  // Fecha o dropdown de fornecedor ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (supplierSearchRef.current && !supplierSearchRef.current.contains(e.target as Node)) {
        setShowSupplierDrop(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function handleSelectSupplier(supplier: SupplierRef) {
    setSelectedSupplier(supplier)
    setValue("supplierId", supplier.id)
    setValue("payeeName", supplier.name)
    setSupplierSearch("")
    setShowSupplierDrop(false)
  }

  function handleClearSupplier() {
    setSelectedSupplier(null)
    setValue("supplierId", null)
    setValue("payeeName", "")
  }

  function handleModeChange(next: "avulso" | "parcelado") {
    setMode(next)
    if (next === "parcelado") {
      // Traz o valor já digitado no Avulso como ponto de partida da divisão.
      handleSplit(Number(getValues("avulsoAmount")) || 0)
    }
  }

  // totalOverride existe pra transição de modo (ver handleModeChange acima) —
  // nesse instante watchedTotal ainda não reflete o valor recém setado via
  // setValue (só no próximo render), então passamos o valor certo direto.
  function handleSplit(totalOverride?: number) {
    const total = totalOverride ?? Number(watchedTotal) ?? 0
    if (total <= 0 || installmentCount < 1) return
    const amounts = splitAmount(total, installmentCount)
    setValue("totalAmount", total)
    replace(
      amounts.map((amount, i) => ({
        amount,
        dueDate: addDays(firstDueDate, i * 30),
        paymentMethodId: defaultPaymentMethodId,
      }))
    )
  }

  function onSubmit(data: RawFormData) {
    if (mode === "avulso") {
      if (!data.avulsoAmount || data.avulsoAmount <= 0) {
        toast.error("Informe o valor.")
        return
      }
      if (!data.avulsoDueDate) {
        toast.error("Informe o vencimento.")
        return
      }
      if (!data.avulsoPaymentMethodId) {
        toast.error("Selecione a forma de pagamento.")
        return
      }
      return onSave({
        groupId: data.groupId,
        supplierId: data.supplierId,
        payeeName: data.payeeName,
        description: data.description,
        issueDate: data.issueDate,
        totalAmount: data.avulsoAmount,
        installments: [
          {
            amount: data.avulsoAmount,
            dueDate: data.avulsoDueDate,
            paymentMethodId: data.avulsoPaymentMethodId,
            documentNumber: data.avulsoDocumentNumber,
          },
        ],
      })
    }

    if (!data.totalAmount || data.totalAmount <= 0) {
      toast.error("Informe o valor total.")
      return
    }
    if (!data.installments || data.installments.length === 0) {
      toast.error("Adicione ao menos uma parcela.")
      return
    }
    return onSave({
      groupId: data.groupId,
      supplierId: data.supplierId,
      payeeName: data.payeeName,
      description: data.description,
      issueDate: data.issueDate,
      totalAmount: data.totalAmount,
      installments: data.installments,
    })
  }

  const supplierTrimmed = supplierSearch.trim().toLowerCase()
  const supplierResults =
    supplierTrimmed.length >= 1
      ? suppliers.filter(
          (s) =>
            s.name.toLowerCase().includes(supplierTrimmed) ||
            s.code.toLowerCase().includes(supplierTrimmed) ||
            s.cnpj.toLowerCase().includes(supplierTrimmed)
        )
      : suppliers

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6">
      <h2 className="text-base font-semibold text-foreground mb-5">
        {editItem ? "Editar Lançamento" : "Novo Lançamento"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Grupo */}
        <div className="flex flex-col gap-1">
          <label htmlFor="p-group" className="text-sm font-medium text-foreground">Grupo</label>
          <select
            id="p-group"
            {...register("groupId")}
            className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}{!g.isActive ? " (inativo)" : ""}
              </option>
            ))}
          </select>
          {errors.groupId && <span className="text-xs text-destructive">{errors.groupId.message}</span>}
        </div>

        {/* Fornecedor / nome livre */}
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground mb-3">Fornecedor (opcional)</p>
          {selectedSupplier ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 flex-wrap">
                <span className="text-sm font-semibold text-primary">{selectedSupplier.name}</span>
                {selectedSupplier.code && (
                  <span className="text-xs text-muted-foreground">{selectedSupplier.code}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearSupplier}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 min-h-[44px] px-2"
              >
                <X size={14} /> limpar
              </button>
            </div>
          ) : (
            <div ref={supplierSearchRef} className="relative max-w-md">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition">
                <Search size={15} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value)
                    setShowSupplierDrop(true)
                  }}
                  onFocus={() => setShowSupplierDrop(true)}
                  placeholder="Buscar fornecedor por nome, código ou CNPJ..."
                  className="flex-1 py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {showSupplierDrop && supplierResults.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                  {supplierResults.map((s) => (
                    <li
                      key={s.id}
                      onMouseDown={() => handleSelectSupplier(s)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted cursor-pointer border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.code}{s.cnpj && ` · ${s.cnpj}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {showSupplierDrop && supplierResults.length === 0 && (
                <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    {suppliers.length === 0
                      ? "Nenhum fornecedor cadastrado ainda. Cadastre em Cadastros → Fornecedores."
                      : "Nenhum fornecedor encontrado."}
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedSupplier && (
            <div className="mt-3">
              <FormInput
                label="Nome (sem fornecedor cadastrado)"
                id="p-payeeName"
                {...register("payeeName")}
                error={errors.payeeName?.message}
              />
            </div>
          )}
        </div>

        {/* Descrição + emissão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Descrição"
            id="p-description"
            placeholder="Ex: Aluguel Agosto/2026"
            {...register("description")}
            error={errors.description?.message}
          />
          <FormInput
            label="Data de emissão (opcional)"
            id="p-issueDate"
            type="date"
            {...register("issueDate")}
            error={errors.issueDate?.message}
          />
        </div>

        {/* Avulso x Parcelado */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Tipo de lançamento</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleModeChange("avulso")}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                mode === "avulso"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Único
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("parcelado")}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                mode === "parcelado"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Parcelado
            </button>
          </div>
        </div>

        {mode === "avulso" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              control={control}
              name="avulsoAmount"
              render={({ field }) => (
                <CurrencyInput
                  id="p-amount"
                  label="Valor (R$)"
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  error={errors.avulsoAmount?.message}
                />
              )}
            />
            <FormInput
              label="Vencimento"
              id="p-dueDate"
              type="date"
              {...register("avulsoDueDate")}
              error={errors.avulsoDueDate?.message}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="p-method" className="text-sm font-medium text-foreground">Forma de pagamento</label>
              <select
                id="p-method"
                {...register("avulsoPaymentMethodId")}
                className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
              >
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}{!m.isActive ? " (inativo)" : ""}</option>
                ))}
              </select>
            </div>
            {needsDocumentNumber(paymentMethods, watchedAvulsoPaymentMethodId) && (
              <FormInput
                label="Número do documento"
                id="p-avulso-doc"
                placeholder="Nº do boleto/cheque"
                {...register("avulsoDocumentNumber")}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Controller
                control={control}
                name="totalAmount"
                render={({ field }) => (
                  <CurrencyInput
                    id="p-total"
                    label="Valor total (R$)"
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    error={errors.totalAmount?.message}
                  />
                )}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="p-count" className="text-sm font-medium text-foreground">Qtd. de parcelas</label>
                <select
                  id="p-count"
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(Number(e.target.value))}
                  className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </select>
              </div>
              <FormInput
                label="1º vencimento"
                id="p-firstDue"
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="p-defaultMethod" className="text-sm font-medium text-foreground">Forma padrão</label>
                <select
                  id="p-defaultMethod"
                  value={defaultPaymentMethodId}
                  onChange={(e) => setDefaultPaymentMethodId(e.target.value)}
                  className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
                >
                  {paymentMethods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSplit()}
              className="self-start flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition min-h-[44px]"
            >
              <Split size={15} /> Dividir em {installmentCount}x
            </button>

            {/* Parcelas editáveis */}
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 pb-2 border-b border-border last:border-0">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-end">
                  <span className="text-xs text-muted-foreground pb-2.5 w-8">
                    {index + 1}/{fields.length}
                  </span>
                  <Controller
                    control={control}
                    name={`installments.${index}.amount`}
                    render={({ field }) => (
                      <CurrencyInput
                        id={`p-inst-amount-${index}`}
                        label={index === 0 ? "Valor (R$)" : undefined}
                        ariaLabel={`Valor da parcela ${index + 1}`}
                        value={field.value ?? 0}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex flex-col gap-1">
                    {index === 0 && (
                      <label htmlFor={`p-inst-due-${index}`} className="text-sm font-medium text-foreground">Vencimento</label>
                    )}
                    <input
                      id={`p-inst-due-${index}`}
                      aria-label={`Vencimento da parcela ${index + 1}`}
                      type="date"
                      {...register(`installments.${index}.dueDate`)}
                      className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    {index === 0 && (
                      <label htmlFor={`p-inst-method-${index}`} className="text-sm font-medium text-foreground">Forma de pgto.</label>
                    )}
                    <select
                      id={`p-inst-method-${index}`}
                      aria-label={`Forma de pagamento da parcela ${index + 1}`}
                      {...register(`installments.${index}.paymentMethodId`)}
                      className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors"
                    >
                      {paymentMethods.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => replace(watchedInstallments.filter((_, i) => i !== index))}
                    disabled={fields.length <= 1}
                    className="h-11 w-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                    title="Remover parcela"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                  {needsDocumentNumber(paymentMethods, watchedInstallments[index]?.paymentMethodId) && (
                    <input
                      aria-label={`Número do documento da parcela ${index + 1}`}
                      placeholder={`Nº do documento da parcela ${index + 1}`}
                      {...register(`installments.${index}.documentNumber`)}
                      className="h-11 rounded-md border border-border bg-input-bg px-3 text-base text-foreground outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  replace([
                    ...watchedInstallments,
                    { amount: 0, dueDate: addDays(firstDueDate, fields.length * 30), paymentMethodId: defaultPaymentMethodId },
                  ])
                }
                className="self-start flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition mt-1"
              >
                <Plus size={14} /> Adicionar parcela
              </button>
            </div>

            {/* Conferência da soma */}
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium ${
                sumMatches ? "bg-details-green/10 text-details-green" : "bg-destructive/10 text-destructive"
              }`}
            >
              <span>Soma das parcelas: R$ {installmentsSum.toFixed(2)}</span>
              <span>Total informado: R$ {(Number(watchedTotal) || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-muted transition min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || (mode === "parcelado" && !sumMatches)}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60 min-h-[44px]"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}
