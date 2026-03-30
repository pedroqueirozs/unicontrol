import { auth } from "@/services/firebaseConfig";
import { signOut } from "firebase/auth";
import { User, Mail, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from "@/components/ConfimDialog";

export default function MyProfile() {
  const { confirm, dialog } = useConfirmDialog();
  const navigate = useNavigate();

  async function handleSignout() {
    const confirmed = await confirm("Realmente deseja sair?");
    if (confirmed) {
      await signOut(auth);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {dialog}

      {/* Avatar e nome */}
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-color_primary_400 rounded-full flex items-center justify-center mb-4">
          {auth.currentUser?.photoURL ? (
            <img
              src={auth.currentUser.photoURL}
              alt="Avatar do usuário"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <User size={40} className="text-white" />
          )}
        </div>
        <h1 className="text-xl font-bold text-color_primary_400">
          {auth.currentUser?.displayName}
        </h1>
        <span className="text-sm text-text_description mt-1">
          Administrador do sistema
        </span>
      </div>

      {/* Informações */}
      <div className="border border-input_border rounded-md divide-y divide-input_border">
        <div className="flex items-center gap-4 px-6 py-4">
          <User size={18} className="text-text_description shrink-0" />
          <div>
            <p className="text-xs text-text_description">Nome completo</p>
            <p className="font-medium">{auth.currentUser?.displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-4">
          <Mail size={18} className="text-text_description shrink-0" />
          <div>
            <p className="text-xs text-text_description">E-mail</p>
            <p className="font-medium">{auth.currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>
        <button
          onClick={handleSignout}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}
