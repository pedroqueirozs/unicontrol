"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Pencil, Plus, Power, X } from "lucide-react"
import { FormInput } from "@/components/form-input"

type LookupItem = {
  id: string
  name: string
  isActive: boolean
}

// Componente genérico pra cadastros simples do Financeiro que só têm
// nome + ativo/inativo (Grupos e Formas de Pagamento) — mesma tela e mesmo
// comportamento pros dois, só muda o endpoint e os textos.
interface SimpleLookupManagerProps {
  icon: React.ReactNode
  title: string
  addLabel: string
  endpoint: string
  emptyMessage: string
}

export function SimpleLookupManager({
  icon,
  title,
  addLabel,
  endpoint,
  emptyMessage,
}: SimpleLookupManagerProps) {
  const [items, setItems] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<LookupItem | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error()
      setItems(await res.json())
    } catch {
      toast.error("Erro ao carregar os dados.")
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openCreate() {
    setEditItem(null)
    setName("")
    setModalOpen(true)
  }

  function openEdit(item: LookupItem) {
    setEditItem(item)
    setName(item.name)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditItem(null)
    setName("")
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Informe um nome.")
      return
    }
    setSaving(true)
    try {
      const res = editItem
        ? await fetch(`${endpoint}/${editItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
          })
        : await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
          })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error ?? "Erro ao salvar.")
        return
      }

      const saved: LookupItem = await res.json()
      setItems((prev) =>
        editItem
          ? prev.map((i) => (i.id === saved.id ? saved : i))
          : [...prev, saved].sort((a, b) => a.name.localeCompare(b.name))
      )
      toast.success(editItem ? "Atualizado com sucesso." : "Criado com sucesso.")
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(item: LookupItem) {
    setTogglingId(item.id)
    try {
      const res = await fetch(`${endpoint}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (!res.ok) {
        toast.error("Erro ao atualizar status.")
        return
      }
      const saved: LookupItem = await res.json()
      setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-semibold text-foreground">{title}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {items.length}
            </span>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{addLabel}</span>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <>
            {/* Tabela desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-foreground">{item.name}</td>
                      <td className="px-5 py-3">
                        <StatusBadge isActive={item.isActive} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Renomear"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(item)}
                            disabled={togglingId === item.id}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              item.isActive
                                ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                : "text-muted-foreground hover:text-green-600 hover:bg-green-500/10"
                            }`}
                            title={item.isActive ? "Inativar" : "Reativar"}
                          >
                            <Power size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="md:hidden flex flex-col divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium text-foreground text-sm">{item.name}</span>
                    <StatusBadge isActive={item.isActive} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={togglingId === item.id}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Modal: criar/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl sm:rounded-xl border border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{editItem ? "Renomear" : addLabel}</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <FormInput
                label="Nome"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                }}
                placeholder="Ex: Empresa X"
              />

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-11 bg-accent text-accent-foreground font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-progress"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
      Ativo
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
      Inativo
    </span>
  )
}
