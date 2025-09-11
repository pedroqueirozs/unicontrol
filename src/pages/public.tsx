import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth";
import LoadingOverlay from "@/components/LoadingOverlay";

const PublicRoutes = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { authed }: any = useAuth();
  if (authed === null) {
    return <LoadingOverlay open={true} />;
  }
  if (authed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};
export default PublicRoutes;
