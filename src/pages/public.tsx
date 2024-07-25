import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";

const PublicRoutes = () => {
  const { authed }: any = useAuth();
  return !authed?.currentUser ? <Outlet /> : <Navigate to="/home" />;
};
export default PublicRoutes;
