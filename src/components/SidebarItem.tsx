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
        `hover:opacity-70 flex items-center justify-start gap-2 p-4  ${
          isActive
            ? "border-l-4 border-details_green rounded-lg font-semibold"
            : ""
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
