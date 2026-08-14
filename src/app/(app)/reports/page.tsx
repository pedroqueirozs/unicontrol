import Link from "next/link"
import { AlignJustify, Receipt, ArrowRight, FileQuestion, type LucideIcon } from "lucide-react"
import { auth } from "@/auth"
import { isAdminLevel } from "@/lib/roles"

type ReportCard = {
  key: string
  label: string
  description: string
  href: string
  icon: LucideIcon
  adminOnly: boolean
}

// Lista de relatórios disponíveis — hoje só Contas a Pagar, mas a ideia é
// outros módulos (Estoque, Vendas...) irem entrando aqui com o tempo, cada um
// decidindo se é adminOnly ou não. A página /reports em si fica visível pra
// todos os papéis (ver src/components/sidebar.tsx) — quem restringe o acesso
// é cada card individualmente, não a rota do hub.
const REPORT_CARDS: ReportCard[] = [
  {
    key: "contas-a-pagar",
    label: "Contas a Pagar",
    description: "Lançamentos filtrados por período, grupo, forma de pagamento e status, com totais.",
    href: "/reports/contas-a-pagar",
    icon: Receipt,
    adminOnly: true,
  },
]

export default async function ReportsPage() {
  const session = await auth()
  const isAdmin = isAdminLevel(session?.user?.role)
  const cards = REPORT_CARDS.filter((card) => !card.adminOnly || isAdmin)

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <AlignJustify size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
            <FileQuestion size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Nenhum relatório disponível</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Não há relatórios liberados para o seu perfil ainda.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-ring transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10">
                  <card.icon size={20} className="text-primary" />
                </div>
                <ArrowRight size={18} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{card.label}</h2>
                <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
