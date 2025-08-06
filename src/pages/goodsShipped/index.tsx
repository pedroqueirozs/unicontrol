import Button from "../../components/Button";
import { CustomDataGrid } from "../../components/CustomDataGrid";
import { HeaderWithFilterAndExport } from "../../components/HeaderWithFilterAndExport";
import Input from "../../components/Input";
import InputSelect from "../../components/InputSelect";
import { GridColDef } from "@mui/x-data-grid";

const rows = [
  {
    id: 1,
    customer: "Loja Centro",
    invoice: "2236",
    city: "Belo Horizonte",
    state: "MG",
    transporter: "Jadlog",
    shipping: "30/07/2025",
    situation: "Em transito",
    estimated_delivery: "05/08/2025",
    delivery_date: "",
    observation: "",
  },
  {
    id: 2,
    customer: "Supermercado Pague Menos",
    invoice: "3347",
    city: "Uberlândia",
    state: "MG",
    transporter: "Braspress",
    shipping: "01/08/2025",
    situation: "Em transito",
    estimated_delivery: "08/08/2025",
    delivery_date: "",
    observation: "",
  },
  {
    id: 3,
    customer: "Drogaria Central",
    invoice: "4458",
    city: "Governador Valadares",
    state: "MG",
    transporter: "Total Express",
    shipping: "29/07/2025",
    situation: "Em transito",
    estimated_delivery: "06/08/2025",
    delivery_date: "",
    observation: "",
  },
  {
    id: 4,
    customer: "Distribuidora ABC",
    invoice: "5569",
    city: "Patos de Minas",
    state: "MG",
    transporter: "Correios",
    shipping: "27/07/2025",
    situation: "Em transito",
    estimated_delivery: "03/08/2025",
    delivery_date: "",
    observation: "",
  },
  {
    id: 5,
    customer: "Auto Peças São José",
    invoice: "6670",
    city: "Divinópolis",
    state: "MG",
    transporter: "Jamef",
    shipping: "02/08/2025",
    situation: "Em transito",
    estimated_delivery: "09/08/2025",
    delivery_date: "",
    observation: "",
  },
];

const columns: GridColDef[] = [
  { field: "customer", headerName: "Cliente", width: 150 },
  { field: "invoice", headerName: "Nota Fiscal", width: 120 },
  { field: "city", headerName: "Cidade", width: 150 },
  { field: "state", headerName: "UF", width: 150 },
  { field: "transporter", headerName: "Transportador", width: 150 },
  { field: "shipping", headerName: "Data de Envio", width: 130 },
  { field: "stuation", headerName: "Situação", width: 130, editable: true },
  {
    field: "estimated_delivery",
    headerName: "Previsão de entrega",
    width: 130,
    editable: true,
  },
  {
    field: "delivery_date",
    headerName: "Data da entrega",
    width: 130,
    editable: true,
  },
  {
    field: "observation",
    headerName: "Observação",
    width: 130,
    editable: true,
  },
];
export default function GoodsShipped() {
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
          <Input
            id="city"
            type="text"
            labelName="Cidade"
            labelId="city"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />
          <Input
            id="uf"
            type="text"
            labelName="UF"
            labelId="uf"
            // {...register("user_email")}
            // errorsSpan={errors.user_email?.message}
          />

          <InputSelect
            id="carrier"
            labelName="Transportadora"
            labelId="carrier"
            options={[
              { value: "braspress", label: "Braspress" },
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
      <CustomDataGrid columns={columns} rows={rows} />
    </div>
  );
}
