import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PublicRoutes from "@/pages/public";
import PrivateRoutes from "@/pages/private";
import AuthLayout from "@/components/layouts/AuthLayout";
import MainLayout from "@/components/layouts/MainLayout";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import GoodsShipped from "@/pages/goodsShipped";
import Documents from "@/pages/documents";
import Financial from "@/pages/financial";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import CustomersPending from "@/pages/customersPending";
import SuppliersPending from "@/pages/suppliersPending";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoutes />,
    children: [
      {
        path: "/",
        element: <AuthLayout />,
        children: [
          { path: "/", element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <PrivateRoutes />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
            handle: { title: "Dashboard" },
          },
          {
            path: "goods-shipped",
            element: <GoodsShipped />,
            handle: { title: "Mercadorias enviadas" },
          },
          {
            path: "documents",
            element: <Documents />,
            handle: { title: "Documentos" },
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
