import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PublicRoutes from "@/routes/PublicRoutes";
import PrivateRoutes from "@/routes/PrivateRoutes";
import AuthLayout from "@/components/layouts/AuthLayout";
import MainLayout from "@/components/layouts/MainLayout";
import Login from "@/pages/login";
import Register from "@/pages/register";
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
            element: <Dashboard />,
            handle: { title: "Dashboard" },
          },
          {
            path: "profile",
            element: <MyProfile />,
            handle: { title: "Meu Perfil" },
          },
          {
            path: "goods-shipped",
            element: <GoodsShipped />,
            handle: { title: "Gestão de mercadorias" },
          },
          {
            path: "address",
            element: <Address />,
            handle: { title: "Gestão de endereços" },
          },
          {
            path: "useful-documents",
            element: <UsefulDocuments />,
            handle: { title: "Documentos Úteis" },
          },
          {
            path: "financial",
            element: <Financial />,
            handle: { title: "Contas a pagar" },
          },
          {
            path: "reports",
            element: <Reports />,
            handle: { title: "Relatórios" },
          },
          {
            path: "settings",
            element: <Settings />,
            handle: { title: "Configurações" },
          },
          {
            path: "customers-pending",
            element: <CustomersPending />,
            handle: { title: "Pendências/ Trocas de clientes" },
          },
          {
            path: "suppliers-pending",
            element: <SuppliersPending />,
            handle: { title: "Pendências com Fornecedores" },
          },
        ],
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
