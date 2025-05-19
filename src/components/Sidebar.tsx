import {
  ChartColumnIncreasing,
  PackagePlus,
  Folder,
  DollarSign,
  AlignJustify,
  Settings,
} from "lucide-react";
import React from "react";
import { SidebarItem } from "./SidebarItem";

import logo from "../../public/images/logo.svg";

const SideBar = React.forwardRef<HTMLElement>(() => {
  return (
    <aside className="w-60 bg-color_primary_400 text-tex_color_white">
      <nav>
        <div className="bg-color_primary_500 text-tex_color_white flex w-full justify-center items-center gap-2 font-bold ">
          <img className="w-8 h-16" src={logo} alt="" /> Unicontrol
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
            to="/goods_shipped"
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
