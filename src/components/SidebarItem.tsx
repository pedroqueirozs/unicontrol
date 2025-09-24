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
        `hover:text-gray-300  flex items-center justify-start gap-2 p-4  ${
          isActive
            ? "bg-color_primary_300 border-l-4 border-color_secondary rounded-lg font-semibold"
            : ""
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
