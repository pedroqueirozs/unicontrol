import { useState } from "react";
import { User } from "lucide-react";
import { auth } from "@/services/firebaseConfig";
import { useConfirmDialog } from "@/components/ConfimDialog";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const navigate = useNavigate();
  async function handleSignout() {
    const confirmed = await confirm("Realmente deseja sair ?");
    if (confirmed) {
      signOut(auth);
      setOpen(false);
      navigate("/");
    }
  }

  return (
    <div className="bg-text_color_white flex w-full justify-between items-center h-20 p-5 rounded-tr-2xl ">
      <h1 className="text-color_primary_400 font-bold text-xl uppercase">
        {title}
      </h1>
      <div className="flex gap-4 justify-center items-center  ">
        <span>Bem vindo, {auth?.currentUser?.displayName}</span>

        <div className="h-full flex items-center text-center justify-center px-6  ">
          <button onClick={() => setOpen((prev) => !prev)}>
            {auth?.currentUser?.photoURL ? (
              <img
                className="w-16 h-16 rounded-full object-cover"
                src={auth?.currentUser?.photoURL}
              />
            ) : (
              <User className="bg-neutral size-11 text-text_color_white p-2 rounded-full" />
            )}
          </button>
        </div>

        {open && (
          <div className="absolute right-0 top-16 w-48 bg-white shadow-lg rounded-xl py-2 z-50">
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Meu Perfil
            </button>
            <button
              onClick={handleSignout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Sair
            </button>
            {dialog}
          </div>
        )}
      </div>
    </div>
  );
}
