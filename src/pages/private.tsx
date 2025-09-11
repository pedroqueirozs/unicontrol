import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth";
import LoadingOverlay from "@/components/LoadingOverlay";

const PrivateRoutes = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { authed }: any = useAuth();

  if (authed === null) {
    return <LoadingOverlay open={true} />;
  }

  return authed ? <Outlet /> : <Navigate to="/" replace />;
};
export default PrivateRoutes;
