import React from "react";
import { User } from "lucide-react";

interface HeaderProps {
  title: string;
}

const Header = React.forwardRef<HTMLElement>(({ title }: HeaderProps) => {
  return (
    <div className="bg-tex_color_white flex w-full justify-between items-center  h-16 p-5 ">
      <span>{title}</span>
      <div className="flex">
        <span>Notificações </span>
        <div>
          <User />
        </div>
      </div>
    </div>
  );
});

export default Header;
