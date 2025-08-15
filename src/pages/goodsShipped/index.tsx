import Button from "../../components/Button";
import { CustomDataGrid } from "../../components/CustomDataGrid";
import { HeaderWithFilterAndExport } from "../../components/HeaderWithFilterAndExport";
import Input from "../../components/Input";
import InputSelect from "../../components/InputSelect";
import { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { db } from "../../services/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export type MerchandiseFormData = {
  name: string;
  document_number: string;
  city: string;
  uf: string;
  transporter: string;
  shipping_date: string;
  delivery_forecast: string;
  situation: string;
  delivery_date?: string | null;
  notes?: string | null;
};
export type MerchandiseFirestoreData = Omit<
  MerchandiseFormData,
  "shipping_date" | "delivery_forecast" | "delivery_date"
> & {
  shipping_date: Timestamp;
  delivery_forecast: Timestamp;
  delivery_date?: Timestamp | null;
  created_at: Timestamp;
};

export type MerchandiseUIData = Omit<
  MerchandiseFirestoreData,
  "shipping_date" | "delivery_forecast" | "delivery_date" | "created_at"
> & {
  id: string;
  shipping_date: string;
  delivery_forecast: string;
  delivery_date?: string;
  created_at: string;
  notes: string;
};

const columns: GridColDef[] = [
  { field: "name", headerName: "Cliente", width: 150 },
  { field: "document_number", headerName: "Nota Fiscal", width: 120 },
  { field: "city", headerName: "Cidade", width: 150 },
  { field: "uf", headerName: "UF", width: 150 },
  { field: "transporter", headerName: "Transportador", width: 150 },
  { field: "shipping_date", headerName: "Data de Envio", width: 130 },
  { field: "situation", headerName: "Situação", width: 130, editable: true },
  {
    field: "delivery_forecast",
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
    field: "notes",
    headerName: "Observação",
    width: 130,
    editable: true,
  },
];

export default function GoodsShipped() {
  const [data, setData] = useState<MerchandiseUIData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableIsLoading, setTableIsLoading] = useState(false);

  const schema = yup.object({
    name: yup.string().max(200, "Máximo de 200 caracteres").required("*"),
    document_number: yup
      .string()
      .max(50, "Máximo de 50 caracteres")
      .required("*"),
    city: yup.string().max(100, "Máximo de 100 caracteres").required("*"),
    uf: yup
      .string()
      .length(2, "O estado deve conter 2 letras")
      .matches(/^[A-Za-z]{2}$/, "O estado deve conter apenas letras")
      .required("*"),
    transporter: yup.string().required("*"),
    shipping_date: yup.string().required("*"),
    delivery_forecast: yup.string().required("*"),
    situation: yup.string().required("*"),
    delivery_date: yup.string().notRequired(),
    notes: yup.string().notRequired().max(1000, "Máximo de 1000 caracteres"),
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<MerchandiseFormData>({
    resolver: yupResolver(schema),
  });

  async function registerNewGoodsShipped(data: MerchandiseFormData) {
    setIsLoading(true);
    try {
      const shippingDate = dayjs(data.shipping_date).startOf("day").toDate();
      const deliveryForecast = dayjs(data.delivery_forecast)
        .startOf("day")
        .toDate();
      const deliveryDate = data.delivery_date
        ? dayjs(data.delivery_date).startOf("day").toDate()
        : null;
      const docRef = await addDoc(collection(db, "goods_shipped"), {
        ...data,
        shipping_date: shippingDate,
        delivery_forecast: deliveryForecast,
        delivery_date: deliveryDate,
        created_at: new Date(),
      });

      console.log("Documento criado com ID:", docRef.id);
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
    } finally {
      setIsLoading(false);
    }
  }
  async function getAllDocuments() {
    setTableIsLoading(true);
    try {
      const q = query(
        collection(db, "goods_shipped"),
        orderBy("created_at", "desc")
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const snapshot = await getDocs(q);

      const docs = await snapshot.docs.map((doc) => {
        const data = doc.data() as MerchandiseFirestoreData;
        return {
          id: doc.id,
          ...data,
          shipping_date: dayjs(data.shipping_date.toDate()).format(
            "DD/MM/YYYY"
          ),
          delivery_forecast: dayjs(data.delivery_forecast.toDate()).format(
            "DD/MM/YYYY"
          ),
          delivery_date: data.delivery_date
            ? dayjs(data.delivery_date.toDate()).format("DD/MM/YYYY")
            : "",
          created_at: dayjs(data.created_at.toDate()).format("DD/MM/YYYY"),
          notes: data.notes ?? "",
        };
      });
      setData(docs);
    } catch (error) {
      console.log(error);
    } finally {
      setTableIsLoading(false);
    }
  }
  useEffect(() => {
    getAllDocuments();
  }, []);

  async function onSubmit(formData: MerchandiseFormData) {
    const normalizedData: MerchandiseFormData = {
      ...formData,
      delivery_date: formData.delivery_date ?? "",
      notes: formData.notes ?? "",
    };

    await registerNewGoodsShipped(normalizedData);
  }
  return (
    <div>
      <h2 className="text-color_primary_400 font-bold">
        Cadastrar nova mercadoria
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" flex flex-col gap-4 my-4"
      >
        <div className="grid grid-cols-3 gap-4 w-full ">
          <Input
            id="name"
            type="text"
            labelName="Nome do Cliente"
            labelId="name"
            {...register("name")}
            errorMessage={errors.name?.message}
          />
          <Input
            id="document_number"
            labelName="Documento/Nota Fiscal"
            labelId="document_number"
            {...register("document_number")}
            errorMessage={errors.document_number?.message}
          />
          <Input
            id="city"
            type="text"
            labelName="Cidade"
            labelId="city"
            {...register("city")}
            errorMessage={errors.city?.message}
          />
          <Input
            id="uf"
            type="text"
            labelName="UF"
            labelId="uf"
            {...register("uf")}
            errorMessage={errors.uf?.message}
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
            {...register("transporter")}
            errorMessage={errors.transporter?.message}
          />
          <Input
            id="shipping_date"
            type="date"
            labelName="Data do envio"
            labelId="shipping_date"
            {...register("shipping_date")}
            errorMessage={errors.shipping_date?.message}
          />
          <Input
            id="delivery_forecast"
            type="date"
            labelName="Previsão de Entrega"
            labelId="delivery_forecast"
            {...register("delivery_forecast")}
            errorMessage={errors.delivery_forecast?.message}
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
            {...register("situation")}
            errorMessage={errors.situation?.message}
          />
          <Input
            id="delivery_date"
            type="date"
            labelName="Data da Entrega"
            labelId="delivery_date"
            {...register("delivery_date")}
            errorMessage={errors.delivery_date?.message}
          />
          <Input
            id="notes"
            type="text"
            labelName="Anotações"
            labelId="notes"
            {...register("notes")}
            errorMessage={errors.notes?.message}
          />
        </div>
        <div className="w-52 flex gap-4 ">
          <Button isLoading={isLoading} text={"Salvar"} type="submit" />
          <Button
            backgroundColor="#F5F7FA"
            color="#555555"
            borderColor="#E0E0E0"
            text={"Limpar"}
          />
        </div>
      </form>
      <HeaderWithFilterAndExport title={"Lista de mercadorias enviadas"} />
      <CustomDataGrid columns={columns} rows={data} loading={tableIsLoading} />
    </div>
  );
}
