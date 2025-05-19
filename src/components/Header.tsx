import { User } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <div className="bg-tex_color_white flex w-full justify-between items-center  h-16 p-5 ">
      <span className="text-color_primary_400 font-bold">{title}</span>
      <div className="flex">
        <span>Notificações </span>
        <div>
          <User />
        </div>
      </div>
    </div>
  )
};


