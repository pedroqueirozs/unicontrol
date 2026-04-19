import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PublicRoutes from "@/routes/PublicRoutes";
import PrivateRoutes from "@/routes/PrivateRoutes";
import { RoleRoute } from "@/routes/RoleRoute";
import AuthLayout from "@/components/layouts/AuthLayout";
import MainLayout from "@/components/layouts/MainLayout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Invite from "@/pages/invite";
import Dashboard from "@/pages/dashboard";
import GoodsShipped from "@/pages/goodsShipped";
import UsefulDocuments from "@/pages/usefulDocuments";
import Financial from "@/pages/financial";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import CustomersPending from "@/pages/customersPending";
import SuppliersPending from "@/pages/suppliersPending";
import Address from "@/pages/addresses";
import MyProfile from "@/pages/myProfile";
import { ResetPassword } from "@/pages/ResetPassword";
import ManageUsers from "@/pages/manageUsers";
import NotFound from "@/pages/notFound";

const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { index: true, element: <Login /> },
          { path: "register", element: <Register /> },
          { path: "reset-password", element: <ResetPassword /> },
          { path: "invite", element: <Invite /> },
        ],
      },
    ],
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            handle: { title: "Dashboard" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <Dashboard />
              </RoleRoute>
            ),
          },
          {
            path: "profile",
            element: <MyProfile />,
            handle: { title: "Meu Perfil" },
          },
          {
            path: "goods-shipped",
            handle: { title: "Gestão de mercadorias" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <GoodsShipped />
              </RoleRoute>
            ),
          },
          {
            path: "address",
            handle: { title: "Gestão de endereços" },
            element: (
              <RoleRoute allowedRoles={["admin", "expedicao"]}>
                <Address />
              </RoleRoute>
            ),
          },
          {
            path: "useful-documents",
            handle: { title: "Documentos Úteis" },
            element: (
              <RoleRoute allowedRoles={["admin", "expedicao"]}>
                <UsefulDocuments />
              </RoleRoute>
            ),
          },
          {
            path: "financial",
            handle: { title: "Contas a pagar" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <Financial />
              </RoleRoute>
            ),
          },
          {
            path: "reports",
            handle: { title: "Relatórios" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <Reports />
              </RoleRoute>
            ),
          },
          {
            path: "settings",
            handle: { title: "Configurações" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <Settings />
              </RoleRoute>
            ),
          },
          {
            path: "customers-pending",
            handle: { title: "Pendências/ Trocas de clientes" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <CustomersPending />
              </RoleRoute>
            ),
          },
          {
            path: "suppliers-pending",
            handle: { title: "Pendências com Fornecedores" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <SuppliersPending />
              </RoleRoute>
            ),
          },
          {
            path: "manage-users",
            handle: { title: "Gerenciar Usuários" },
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </RoleRoute>
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
