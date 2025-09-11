import { auth } from "@/services/firebaseConfig";
import { signOut } from "firebase/auth";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConfirmDialog } from "@/components/ConfimDialog";

export default function MyProfile() {
  const { confirm, dialog } = useConfirmDialog();
  const navigate = useNavigate();

  async function handleSignout() {
    const confirmed = await confirm("Realmente deseja sair ?");
    if (confirmed) {
      signOut(auth);
    }
  }
  const handleClose = () => {
    navigate(-1);
  };
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {dialog}
      <header className="bg-color_primary_400 text-white px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            {auth?.currentUser?.photoURL ? (
              <img
                src={auth.currentUser.photoURL}
                alt="Avatar do usuário"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold">
              {auth.currentUser?.displayName}
            </h1>
            <p className="text-blue-100 text-sm font-medium">
              Administrador do sistema
            </p>
          </div>
        </div>
      </header>
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Informações pessoais
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-600">
              Nome Completo
            </span>
            <span className="text-gray-900 font-medium">
              {auth.currentUser?.displayName}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-600">E-mail</span>
            <span className="text-gray-900 font-medium">
              {auth.currentUser?.email}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Fechar
          </button>
          <button
            onClick={handleSignout}
            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
