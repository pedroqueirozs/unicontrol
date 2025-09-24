/* import Button from "@/components/Button";
import Input from "@/components/Input";
import InputSelect from "@/components/InputSelect"; */

import { Cog, Wrench } from "lucide-react";

export default function SuppliersPending() {
  /*  return (
    <div>
      <h2 className="text-color_primary_400 font-bold">
        Cadastrar nova pendência de fornecedor
      </h2>
      <form action="#" className="flex-col my-2">
        <div className="grid grid-cols-3 gap-4 w-full ">
          <Input
            id="name"
            type="text"
            labelName="Nome do Fornecedor"
            labelId="name"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="document_number"
            type="number"
            labelName="Documento/Nota Fiscal"
            labelId="document_number"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="city"
            type="text"
            labelName="Cidade"
            labelId="city"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />

          <Input
            id="registration_date"
            type="date"
            labelName="Data do registro"
            labelId="registration_date"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
          <InputSelect
            id="status"
            labelName="Status"
            labelId="status"
            options={[
              { value: "pending", label: "Pendente" },
              { value: "resolved", label: "Resolvido" },
            ]}
          />
          <Input
            id="delivery_forecast"
            type="date"
            labelName="Encerramento"
            labelId="delivery_forecast"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />

          <Input
            id="notes"
            type="text"
            labelName="Anotações"
            labelId="notes"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
        </div>
        <div className="w-52 flex gap-4 ">
          <Button text={"Salvar"} />
          <Button
            backgroundColor="#F5F7FA"
            color="#555555"
            borderColor="#E0E0E0"
            text={"Limpar"}
          />
        </div>
      </form>
    </div>
  ); */
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
