import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./pages/private";
import Home from "./pages/home";
import Login from "./pages/login";
import PublicRoutes from "./pages/public";
import Register from "./pages/register";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoutes />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<PrivateRoutes />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
