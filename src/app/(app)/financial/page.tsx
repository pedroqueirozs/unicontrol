"use client"

import { useState } from "react"
import { LayoutDashboard, Receipt, Building2, CreditCard } from "lucide-react"
import { SimpleLookupManager } from "./simple-lookup-manager"
import { LancamentosTab } from "./lancamentos-tab"
import { DashboardTab } from "./dashboard-tab"

type Tab = "dashboard" | "lancamentos" | "grupos" | "formas-pagamento"

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "lancamentos", label: "Lançamentos", icon: <Receipt size={20} /> },
  { key: "grupos", label: "Grupos", icon: <Building2 size={20} /> },
  { key: "formas-pagamento", label: "Formas de Pagamento", icon: <CreditCard size={20} /> },
]

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Receipt size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-full overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-base font-semibold transition whitespace-nowrap min-h-[48px] ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "lancamentos" && <LancamentosTab />}
      {activeTab === "grupos" && (
        <SimpleLookupManager
          icon={<Building2 size={18} className="text-muted-foreground" />}
          title="Grupos"
          addLabel="Novo grupo"
          endpoint="/api/financial/groups"
          emptyMessage="Nenhum grupo cadastrado ainda."
        />
      )}
      {activeTab === "formas-pagamento" && (
        <SimpleLookupManager
          icon={<CreditCard size={18} className="text-muted-foreground" />}
          title="Formas de Pagamento"
          addLabel="Nova forma de pagamento"
          endpoint="/api/financial/payment-methods"
          emptyMessage="Nenhuma forma de pagamento cadastrada ainda."
        />
      )}
    </div>
  )
}
