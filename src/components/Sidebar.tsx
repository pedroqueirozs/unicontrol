import {
  ChartColumnIncreasing,
  PackagePlus,
  Folder,
  DollarSign,
  AlignJustify,
  Settings,
  Users,
  ShieldAlert,
} from "lucide-react";
import React from "react";
import { SidebarItem } from "./SidebarItem";

import logo from "../assets/logo.svg";

const SideBar = React.forwardRef<HTMLElement>(() => {
  return (
    <aside className="w-80 bg-color_primary_400 text-tex_color_white rounded-s-2xl">
      <nav>
        <div className="bg-color_primary_500 text-tex_color_white flex w-full justify-center items-center gap-2 rounded-tl-2xl">
          <img className="h-20 w-auto" src={logo} alt="" />
        </div>
        <ul className="space-y-4 text-center flex flex-col gap-8 py-8 ">
          <SidebarItem
            icon={
              <ChartColumnIncreasing className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Dashboard"
            to="/dashboard"
          />
          <SidebarItem
            icon={
              <PackagePlus className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Mercadorias"
            to="/goods-shipped"
          />
          <SidebarItem
            icon={
              <Folder className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Documentos"
            to="/documents"
          />
          <SidebarItem
            icon={
              <DollarSign className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Financeiro"
            to="/financial"
          />
          <SidebarItem
            icon={
              <AlignJustify className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Relatórios"
            to="/reports"
          />
          <SidebarItem
            icon={
              <Users className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Pendências/Clientes"
            to="/customers-pending"
          />
          <SidebarItem
            icon={
              <ShieldAlert className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Pendências/Fornecedores"
            to="/suppliers-pending"
          />
          <SidebarItem
            icon={
              <Settings className="size-11  bg-color_primary_300 rounded-full p-2" />
            }
            label="Configurações"
            to="/settings"
          />
        </ul>
      </nav>
    </aside>
  );
});

export default SideBar;
