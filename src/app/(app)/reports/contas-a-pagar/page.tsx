import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { isAdminLevel } from "@/lib/roles"
import { ContasAPagarReport } from "./contas-a-pagar-report"

// /reports é visível a todos os papéis no menu (é um hub genérico), então tem
// mais chance de alguém sem permissão cair aqui clicando por curiosidade —
// diferente de /financial, que já nem aparece no menu pra quem não é admin.
// Por isso esse redirect extra: evita renderizar uma tela de filtros cujo
// fetch inicial já ia dar 403. A API continua sendo o ponto real de segurança.
export default async function ContasAPagarReportPage() {
  const session = await auth()
  if (!session?.user?.companyId || !isAdminLevel(session.user.role)) {
    redirect("/reports")
  }

  return <ContasAPagarReport />
}
