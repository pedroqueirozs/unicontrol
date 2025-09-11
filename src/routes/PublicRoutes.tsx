import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingOverlay from "@/components/LoadingOverlay";

const PublicRoutes = () => {
  const { authed } = useAuth();
  if (authed === null) {
    return <LoadingOverlay open={true} />;
  }
  if (authed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};
export default PublicRoutes;
