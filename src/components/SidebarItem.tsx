import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon: ReactNode;
  to: string;
  label: string;
}

export function SidebarItem({ icon, to, label }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `hover:text-gray-300 flex flex-col items-center justify-center  ${
          isActive ? "bg-color_primary_300 font-semibold" : ""
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
