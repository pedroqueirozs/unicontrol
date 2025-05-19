import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./pages/private";
import Dashboard from "./pages/dashboard";
import GoodsShipped from "./pages/dashboard";
import Login from "./pages/login";
import PublicRoutes from "./pages/public";
import Register from "./pages/register";
import AuthLayout from "./components/layouts/AuthLayout";
import MainLayout from "./components/layouts/MainLayout";
import Documents from "./pages/documents";
import Financial from "./pages/financial";
import Reports from "./pages/reports";
import Settings from "./pages/settings";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoutes />}>
          <Route path="/" element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>
        <Route path="/" element={<PrivateRoutes />}>
          <Route path="/" element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goods_shipped" element={<GoodsShipped />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
