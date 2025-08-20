import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth";

const PrivateRoutes = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { authed }: any = useAuth();

  return authed ? <Outlet /> : <Navigate to="/" />;
};
export default PrivateRoutes;
