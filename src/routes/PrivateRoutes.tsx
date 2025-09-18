import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingOverlay from "@/components/LoadingOverlay";

const PrivateRoutes = () => {
  const { authed, registering } = useAuth();

  if (authed === null || registering) {
    return <LoadingOverlay open={true} />;
  }

  return authed ? <Outlet /> : <Navigate to="/" replace />;
};
export default PrivateRoutes;
