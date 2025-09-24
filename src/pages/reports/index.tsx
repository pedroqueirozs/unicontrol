import { Cog, Wrench } from "lucide-react";

export default function Reports() {
  return (
    <div className=" flex items-center justify-center p-4 min-h-full">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-200">
        <div className="relative mb-6">
          <div className="animate-spin-slow inline-block">
            <Cog className="w-16 h-16 text-blue-500 mx-auto" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Wrench className="w-6 h-6 text-orange-500 animate-bounce" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Módulo em Manutenção
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Estamos trabalhando para melhorar sua experiência. Este módulo estará
          disponível em breve.
        </p>
      </div>
    </div>
  );
}
