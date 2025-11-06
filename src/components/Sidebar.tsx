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
} from "lucide-react";
import React from "react";
import { SidebarItem } from "@/components/SidebarItem";

import logotipoLightSvg from "@/assets/unicontrol-logo-light.svg";

const SideBar = React.forwardRef<HTMLElement>(() => {
  return (
    <aside className="w-80 bg-background_primary_400 rounded-r-2xl text-text_white">
      <nav>
        <div className="h-20 flex w-full justify-center items-center p-4">
          <img
            className=""
            src={logotipoLightSvg}
            alt="logomarca do software unicontrol"
          />
        </div>
        <ul className="text-center flex flex-col gap-2 py-8 ">
          <SidebarItem
            icon={<ChartColumnIncreasing size={24} />}
            label="Dashboard"
            to="/dashboard"
          />
          <SidebarItem
            icon={<PackagePlus size={24} />}
            label="Mercadorias"
            to="/goods-shipped"
          />
          <SidebarItem
            icon={<Folder size={24} />}
            label="Documentos Úteis"
            to="/useful-documents"
          />
          <SidebarItem
            icon={<DollarSign size={24} />}
            label="Financeiro"
            to="/financial"
          />
          <SidebarItem
            icon={<AlignJustify size={24} />}
            label="Relatórios"
            to="/reports"
          />
          <SidebarItem
            icon={<MapPin size={24} />}
            label="Endereços"
            to="/address"
          />
          <SidebarItem
            icon={<Users size={24} />}
            label="Pendências/Clientes"
            to="/customers-pending"
          />
          <SidebarItem
            icon={<ShieldAlert size={24} />}
            label="Pendências/Fornecedores"
            to="/suppliers-pending"
          />
          <SidebarItem
            icon={<Settings size={24} />}
            label="Configurações"
            to="/settings"
          />
        </ul>
      </nav>
    </aside>
  );
});

export default SideBar;
