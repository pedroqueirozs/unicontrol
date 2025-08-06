import Button from "../../components/Button";
import { HeaderWithFilterAndExport } from "../../components/HeaderWithFilterAndExport";
import Input from "../../components/Input";
import InputSelect from "../../components/InputSelect";
import { PaginationFooter } from "../../components/PaginationFooter";
import { ShippingRecord } from "../../components/ShippingRecord";
import { useState } from "react";
import { useEffect } from "react";

export default async function GoodsShipped() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:3000/goods_shipped");
      const json = await response.json();
      setData(json);
    };
    fetchData();
  }, []);
  console.log(data);
  return (
    <div>
      <h2 className="text-color_primary_400 font-bold">
        Cadastrar nova mercadoria
      </h2>
      <form action="#" className=" flex flex-col gap-4 my-4">
        <div className="grid grid-cols-3 gap-4 w-full ">
          <Input
            id="name"
            type="text"
            labelName="Nome do Cliente"
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

          <InputSelect
            id="carrier"
            labelName="Transportadora"
            labelId="carrier"
            options={[
              { value: "braspres", label: "Braspress" },
              { value: "correios", label: "Correios" },
              { value: "withdrawal", label: "Retirada na Empresa" },
              { value: "other", label: "Outro" },
            ]}
          />
          <Input
            id="shipping_date"
            type="date"
            labelName="Data do envio"
            labelId="shipping_date"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="delivery_forecast"
            type="date"
            labelName="Previsão de Entrega"
            labelId="delivery_forecast"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
          <InputSelect
            id="situation"
            labelName="Situação"
            labelId="situation"
            options={[
              { value: "on_time", label: "No Prazo" },
              { value: "delivered", label: "Entregue" },
              { value: "late", label: "Atrasada" },
              { value: "pending", label: "Pendência" },
            ]}
          />
          <Input
            id="delivery_date"
            type="date"
            labelName="Data da Entrega"
            labelId="delivery_date"
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
      <HeaderWithFilterAndExport title={"Lista de mercadorias enviadas"} />
      <div className="grid grid-cols-9 items-center gap-2 p-2 bg-color_primary_400 text-tex_color_white rounded">
        <span>Cliente</span>
        <span>Nota Fiscal</span>
        <span>Cidade</span>
        <span>Transportadora</span>
        <span>Envio</span>
        <span>Previsão</span>
        <span>Situação</span>
        <span>Entrega</span>
        <span className="text-center">Actions</span>
      </div>
      <ShippingRecord
        client="Paróquia N Sra de Fátima"
        invoice="2021"
        city="Rio de Janeiro - RJ"
        carrier="Correios"
        shippingDate="10/05/2025"
        deliveryForecast="25/06/2025"
        situation="No prazo"
        /* deliveryDate="15/05/2025" */
        observation="Enviado para maraba em nome do Pe. Maciel - Codigo de rastreio AA12345678BR"
      />

      <PaginationFooter />
    </div>
  );
}
