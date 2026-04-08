import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/context/auth";
import LoadingOverlay from "@/components/LoadingOverlay";

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

// Primeira rota acessível por role — usada como redirecionamento padrão
const DEFAULT_ROUTE: Record<UserRole, string> = {
  admin: "/dashboard",
  expedicao: "/address",
  vendas: "/profile",
};

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { userData, authed } = useAuth();

  // Ainda carregando
  if (authed === null) return <LoadingOverlay open={true} />;

  const role = userData?.role;

  // Usuário não tem role definido (documento users/{uid} não existe)
  if (!role) return <Navigate to="/" replace />;

  // Usuário tem role mas não tem permissão para essa rota
  if (!allowedRoles.includes(role)) {
    return <Navigate to={DEFAULT_ROUTE[role]} replace />;
  }

  return <>{children}</>;
}
