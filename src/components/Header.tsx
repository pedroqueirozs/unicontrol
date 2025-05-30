import { User } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <div className="bg-tex_color_white flex w-full justify-between items-center  h-16 p-5 ">
      <h1 className="text-color_primary_400 font-bold">{title}</h1>
      <div className="flex gap-6 justify-center">
        <a className="bg-color_tertiary text-tex_color_white p-2 rounded-3xl">
          NOTIFICAÇÕES
        </a>
        <button className="flex justify-center items-center">
          <User className="bg-neutral size-11 text-tex_color_white p-2 rounded-full" />
        </button>
      </div>
    </div>
  );
}
