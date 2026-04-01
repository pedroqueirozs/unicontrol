import { Navigate } from "react-router-dom";

// O cadastro é feito apenas por convite. Acesse /invite?token=xxx
export default function Register() {
  return <Navigate to="/" replace />;
}
