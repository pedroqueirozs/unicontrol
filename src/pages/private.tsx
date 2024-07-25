import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";

const PrivateRoutes = () => {
  const { authed }: any = useAuth();
  return authed?.currentUser ? <Outlet /> : <Navigate to="/" />;
};
export default PrivateRoutes;
