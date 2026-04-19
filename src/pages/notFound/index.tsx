import { useNavigate } from "react-router-dom";
import { House } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background_white gap-6 text-center px-4">
      <p className="text-8xl font-extrabold text-background_primary_400">404</p>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text_primary_400">
          Página não encontrada
        </h1>
        <p className="text-text_secondary">
          O endereço que você acessou não existe ou foi removido.
        </p>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-background_primary_400 text-text_white font-medium hover:opacity-80 transition-opacity"
      >
        <House size={18} />
        Voltar para o início
      </button>
    </div>
  );
}
