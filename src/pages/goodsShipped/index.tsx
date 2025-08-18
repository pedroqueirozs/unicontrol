import { useEffect, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import dayjs from "dayjs";

import InputSelect from "../../components/InputSelect";
import Input from "../../components/Input";
import Button from "../../components/Button";

import { CustomDataGrid } from "../../components/CustomDataGrid";
import { useConfirmDialog } from "../../components/ConfimDialog";
import { GridColDef } from "@mui/x-data-grid";

import { db } from "../../services/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { notify } from "../../utils/notify";

export type MerchandiseFormData = {
  name: string;
  document_number: string;
  city: string;
  uf: string;
  transporter: string;
  shipping_date: string;
  delivery_forecast: string;
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
  {
    field: "situation",
    headerName: "Situação",
    width: 130,
    editable: false,
    renderCell: (params) => {
      const value = params.value as string;

      let color = "";
      if (value === "Atrasada") color = "red";
      if (value === "Entregue") color = "green";
      if (value === "No Prazo") color = "blue";

      return <span style={{ color, fontWeight: "bold" }}>{value}</span>;
    },
  },

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
  const [tableIsLoading, setTableIsLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();
  const [visibleForm, setVisibleForm] = useState(false);

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
    delivery_date: yup.string().notRequired(),
    notes: yup.string().notRequired().max(1000, "Máximo de 1000 caracteres"),
  });
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<MerchandiseFormData>({
    resolver: yupResolver(schema),
  });

  async function registerNewGoodsShipped(data: MerchandiseFormData) {
    try {
      const shippingDate = dayjs(data.shipping_date).startOf("day").toDate();
      const deliveryForecast = dayjs(data.delivery_forecast)
        .startOf("day")
        .toDate();
      const deliveryDate = data.delivery_date
        ? dayjs(data.delivery_date).startOf("day").toDate()
        : null;
      const confirmed = await confirm(
        "Tem certeza que deseja cadastrar essa mercadoria?"
      );
      if (confirmed) {
        const docRef = await addDoc(collection(db, "goods_shipped"), {
          ...data,
          shipping_date: shippingDate,
          delivery_forecast: deliveryForecast,
          delivery_date: deliveryDate,
          created_at: new Date(),
        });
        reset();
        notify.success("Cadastrado com sucesso!");
        await getAllDocuments();

        console.log("Documento criado com ID:", docRef.id);
      }
    } catch (error) {
      notify.error("Erro ao cadastrar, verifique os dados.");
      console.error("Erro ao adicionar documento:", error);
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
        const deliveryDate = data.delivery_date
          ? data.delivery_date.toDate()
          : null;
        const deliveryForecast = data.delivery_forecast.toDate();

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
          situation: calculateSituation(deliveryDate, deliveryForecast),
        };
      });

      setData(docs);
    } catch (error) {
      console.log(error);
    } finally {
      setTableIsLoading(false);
    }
  }
  function calculateSituation(
    deliveryDate: Date | null,
    deliveryForecast: Date
  ): string {
    const today = dayjs().startOf("day");

    if (deliveryDate) {
      return "Entregue";
    }

    if (today.isAfter(dayjs(deliveryForecast))) {
      return "Atrasada";
    }

    return "No Prazo";
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
      <div className="flex justify-between text-center items-center mb-8">
        <h2 className="text-color_primary_400 font-bold">
          Lista de mercadorias enviadas
        </h2>
        <Button
          type="button"
          text={visibleForm ? "Fechar" : "Cadastrar nova +"}
          onClick={() => setVisibleForm((prev) => !prev)}
        />
      </div>

      {visibleForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" flex flex-col gap-4 my-8"
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
                { value: "Braspress", label: "Braspress" },
                { value: "Correios", label: "Correios" },
                { value: "Retirada na Empresa", label: "Retirada na Empresa" },
                { value: "Outro", label: "Outro" },
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
            <Button text={"Salvar"} type="submit" />
            {dialog}
            <Button
              onClick={() => reset()}
              backgroundColor="#F5F7FA"
              color="#555555"
              borderColor="#E0E0E0"
              text={"Limpar"}
            />
          </div>
        </form>
      )}
      <CustomDataGrid
        columns={columns}
        rows={data}
        loading={tableIsLoading}
        showToolbar
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#1A2A38",
            fontWeight: "bold ",
          },
        }}
      />
    </div>
  );
}
