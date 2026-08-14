export function currency(value: string | number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
}

// Pra datas "puras" (dueDate/issueDate) — vêm de <input type="date"> como
// meia-noite UTC, então formatar em UTC evita virar o dia errado conforme o
// fuso do navegador.
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(iso))
}

// Pra timestamps de verdade (createdAt) — aqui sim o fuso local do navegador
// é o correto, é literalmente "que dia era aqui quando isso foi criado".
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso))
}

export function installmentStatus(inst: { status: "pendente" | "pago"; dueDate: string }): "pendente" | "vencida" | "pago" {
  if (inst.status === "pago") return "pago"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(inst.dueDate) < today ? "vencida" : "pendente"
}

export function StatusBadge({ status }: { status: "pendente" | "vencida" | "pago" }) {
  const styles = {
    pendente: "bg-primary/10 text-primary",
    vencida: "bg-destructive/10 text-destructive",
    pago: "bg-details-green/15 text-details-green",
  }
  const labels = { pendente: "Pendente", vencida: "Vencida", pago: "Pago" }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>{labels[status]}</span>
  )
}
