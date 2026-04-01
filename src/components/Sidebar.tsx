import {
  ChartColumnIncreasing,
  PackagePlus,
  Folder,
  DollarSign,
  AlignJustify,
  Settings,
  Users,
  ShieldAlert,
  MapPin,
  UserCog,
} from "lucide-react";
import React from "react";
import { SidebarItem } from "@/components/SidebarItem";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/context/auth";

import logotipoLightSvg from "@/assets/unicontrol-logo-light.svg";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: <ChartColumnIncreasing size={24} />,
    to: "/dashboard",
    roles: ["admin"],
  },
  {
    label: "Mercadorias",
    icon: <PackagePlus size={24} />,
    to: "/goods-shipped",
    roles: ["admin"],
  },
  {
    label: "Documentos Úteis",
    icon: <Folder size={24} />,
    to: "/useful-documents",
    roles: ["admin", "expedicao"],
  },
  {
    label: "Financeiro",
    icon: <DollarSign size={24} />,
    to: "/financial",
    roles: ["admin"],
  },
  {
    label: "Relatórios",
    icon: <AlignJustify size={24} />,
    to: "/reports",
    roles: ["admin"],
  },
  {
    label: "Endereços",
    icon: <MapPin size={24} />,
    to: "/address",
    roles: ["admin", "expedicao"],
  },
  {
    label: "Pendências/Clientes",
    icon: <Users size={24} />,
    to: "/customers-pending",
    roles: ["admin"],
  },
  {
    label: "Pendências/Fornecedores",
    icon: <ShieldAlert size={24} />,
    to: "/suppliers-pending",
    roles: ["admin"],
  },
  {
    label: "Configurações",
    icon: <Settings size={24} />,
    to: "/settings",
    roles: ["admin"],
  },
  {
    label: "Gerenciar Usuários",
    icon: <UserCog size={24} />,
    to: "/manage-users",
    roles: ["admin"],
  },
];

const SideBar = React.forwardRef<HTMLElement>(() => {
  const { userData } = useAuth();
  const role = userData?.role;

  const visibleItems = NAV_ITEMS.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <aside className="w-80 bg-background_primary_400 rounded-r-2xl text-text_white">
      <nav>
        <div className="h-20 flex w-full justify-center items-center p-4">
          <img
            src={logotipoLightSvg}
            alt="logomarca do software unicontrol"
          />
        </div>
        <ul className="text-center flex flex-col gap-2 py-8">
          {visibleItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
});

export default SideBar;
