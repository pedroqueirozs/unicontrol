import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Input from "@/components/Input";
import Button from "@/components/Button";

import { useConfirmDialog } from "@/components/ConfimDialog";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";

import { db } from "@/services/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { notify } from "@/utils/notify";
import {
  Circle,
  CircleCheck,
  CircleMinus,
  CirclePlus,
  Pencil,
  Trash2,
} from "lucide-react";

export type AddressFormData = {
  recipient: string;
  street: string;
  city: string;
  district: string;
  complement?: string | null;
  zip: string;
};
export type AddressFirestoreData = AddressFormData & {
  created_at: Timestamp;
};
export type AddressUIData = AddressFormData & {
  id: string;
};
export type SelectedAddress = AddressUIData & {
  amount: number;
};

export default function Addresses() {
  const [data, setData] = useState<AddressFormData[]>([]);
  const [tableIsLoading, setTableIsLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();
  const [visibleForm, setVisibleForm] = useState(false);
  const [editItem, setEditItem] = useState<AddressUIData | null>(null);
  const paginationModel = { page: 0, pageSize: 10 };
  const [selectedAddressesIds, setSelectedAddressesIds] = useState<string[]>(
    []
  );
  const [selectedAddresses, setSelectedAddresses] = useState<SelectedAddress[]>(
    []
  );

  const defaultFormValues: AddressFormData = {
    recipient: "",
    city: "",
    zip: "",
    district: "",
    complement: "",
    street: "",
  };

  console.log(selectedAddresses);
  const schema = yup.object({
    recipient: yup.string().max(200, "Máximo de 200 caracteres").required("*"),
    street: yup.string().max(350, "Máximo de 350 caracteres").required("*"),
    city: yup.string().max(100, "Máximo de 100 caracteres").required("*"),
    zip: yup.string().required("*"),
    complement: yup.string().notRequired(),
    district: yup.string().required("*"),
  });
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      recipient: "",
      city: "",
      zip: "",
      district: "",
      complement: "",
      street: "",
    },
  });
  const printableAddressColumns: GridColDef[] = [
    { field: "recipient", headerName: "Destinatário", width: 150 },
    { field: "street", headerName: "Endereço", width: 120 },
    { field: "district", headerName: "Bairro", width: 120 },
    { field: "zip", headerName: "Cep", width: 120 },
    { field: "city", headerName: "Cidade", width: 150 },
    { field: "complement", headerName: "Complemento", width: 150 },
    { field: "amount", headerName: "Quantidade", width: 150 },
    {
      field: "actions",
      headerName: "Ações",
      minWidth: 300,
      renderCell: (params) => {
        const isSelected = selectedAddressesIds.includes(params.id as string);
        console.log(isSelected);
        return (
          <div className="flex h-full gap-4 items-center">
            <button
              className="text-color_error"
              onClick={() => decreaseAddressQuantity(params.id as string)}
            >
              <CircleMinus />
            </button>
            <button
              onClick={() => increaseAddressQuantity(params.id as string)}
            >
              <CirclePlus />
            </button>
            <button
              className={isSelected ? "text-[#2ECC71]" : ""}
              onClick={() => handleSelectedAddresses(params.row)}
            >
              {isSelected ? <CircleCheck /> : <Circle />}
            </button>
          </div>
        );
      },
    },
  ];
  const addressColumns: GridColDef[] = [
    { field: "recipient", headerName: "Destinatário", width: 150 },
    { field: "street", headerName: "Endereço", width: 120 },
    { field: "district", headerName: "Bairro", width: 120 },
    { field: "zip", headerName: "Cep", width: 120 },
    { field: "city", headerName: "Cidade", width: 150 },
    { field: "complement", headerName: "Complemento", width: 150 },
    {
      field: "actions",
      headerName: "Ações",
      minWidth: 150,
      renderCell: (params) => {
        const isSelected = selectedAddressesIds.includes(params.id as string);
        console.log(isSelected);
        return (
          <div className="flex h-full gap-4 items-center">
            <button
              className="text-color_error"
              onClick={() => handleDelete(params.id as string)}
            >
              <Trash2 />
            </button>
            <button onClick={() => handleEdit(params.row)}>
              <Pencil />
            </button>
            <button
              className={isSelected ? "text-[#2ECC71]" : ""}
              onClick={() => handleSelectedAddresses(params.row)}
            >
              {isSelected ? <CircleCheck /> : <Circle />}
            </button>
          </div>
        );
      },
    },
  ];
  function increaseAddressQuantity(id: string) {
    setSelectedAddresses((prev) =>
      prev.map((address) =>
        address.id === id
          ? {
              ...address,
              amount: address.amount + 1,
            }
          : address
      )
    );
  }

  function decreaseAddressQuantity(id: string) {
    setSelectedAddresses((prev) =>
      prev.map((address) =>
        address.id === id && address.amount > 1
          ? { ...address, amount: address.amount - 1 }
          : address
      )
    );
  }
  function handleSelectedAddresses(row: AddressUIData) {
    setSelectedAddressesIds((prev) => {
      if (prev.includes(row.id)) {
        setSelectedAddresses((sel) => sel.filter((r) => r.id !== row.id));
        return prev.filter((id) => id !== row.id);
      } else {
        setSelectedAddresses((sel) => [...sel, { ...row, amount: 1 }]);
        return [...prev, row.id];
      }
    });
  }

  function handleEdit(item: AddressUIData) {
    setEditItem(item);
    setVisibleForm(true);
    reset({
      recipient: item.recipient,
      street: item.street,
      city: item.city,
      zip: item.zip,
      district: item.district,
      complement: item.complement ?? "",
    });
  }
  async function handleDelete(id: string) {
    try {
      const confirmed = await confirm("Deseja deletar este registro?");
      if (confirmed) {
        await deleteDoc(doc(db, "addresses", id));
        notify.success("Deletado com sucesso!");
        await getAllDocuments();
      }
    } catch (error) {
      notify.error("Erro ao deletar o registro.");
    }
  }

  async function registerNewAddress(data: AddressFormData) {
    try {
      const confirmed = await confirm(
        "Tem certeza que deseja cadastrar este endereço?"
      );
      if (confirmed) {
        const docRef = await addDoc(collection(db, "addresses"), {
          ...data,
          created_at: new Date(),
        });
        reset(defaultFormValues);
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
        collection(db, "addresses"),
        orderBy("created_at", "desc")
      );

      const snapshot = await getDocs(q);

      const docs = await snapshot.docs.map((doc) => {
        const data = doc.data() as AddressFormData;
        return {
          id: doc.id,
          ...data,
          complement: data.complement ?? "",
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

  async function onSubmit(formData: AddressFormData) {
    const payload = {
      ...formData,
    };

    try {
      if (editItem) {
        const ref = doc(db, "addresses", editItem.id);
        await updateDoc(ref, payload);
        notify.success("Atualizado com sucesso!");
      } else {
        const normalizedData: AddressFormData = {
          ...formData,
          complement: formData.complement ?? "",
        };

        await registerNewAddress(normalizedData);
      }

      setEditItem(null);
      reset(defaultFormValues);
      setVisibleForm(false);
      await getAllDocuments();
    } catch (error) {
      notify.error("Erro ao salvar registro.");
      console.error(error);
    }
  }
  return (
    <div>
      <div className="flex justify-between text-center items-center mb-8">
        <h2 className="text-color_primary_400 font-bold">
          Endereços cadastrados
        </h2>
        <Button
          type="button"
          text={visibleForm ? "Fechar" : "Novo +"}
          onClick={() => setVisibleForm((prev) => !prev)}
        />
        {dialog}
      </div>

      {visibleForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" flex flex-col gap-4 my-8"
        >
          <div className="grid grid-cols-3 gap-4 w-full ">
            <Input
              id="recipient"
              type="text"
              labelName="Destinatário"
              labelId="recipient"
              {...register("recipient")}
              errorMessage={errors.recipient?.message}
            />

            <Input
              id="street"
              type="text"
              labelName="Endereço"
              labelId="street"
              {...register("street")}
              errorMessage={errors.street?.message}
            />
            <Input
              id="district"
              type="text"
              labelName="Bairro/Distrito"
              labelId="district"
              {...register("district")}
              errorMessage={errors.district?.message}
            />
            <Input
              id="zip"
              type="text"
              labelName="Cep"
              labelId="zip"
              {...register("zip")}
              errorMessage={errors.zip?.message}
            />
            <Input
              id="city"
              type="text"
              labelName="Cidade/UF"
              labelId="city"
              {...register("city")}
              errorMessage={errors.city?.message}
            />

            <Input
              id="complement"
              type="text"
              labelName="Complemento"
              labelId="complement"
              {...register("complement")}
              errorMessage={errors.complement?.message}
            />
          </div>
          <div className="w-52 flex gap-4 ">
            <Button text={editItem ? "Atualizar" : "Salvar"} type="submit" />
            <Button
              onClick={() => reset(defaultFormValues)}
              backgroundColor="#F5F7FA"
              color="#555555"
              borderColor="#E0E0E0"
              text={"Limpar"}
            />
          </div>
          {editItem && (
            <Button
              text="Cancelar edição"
              onClick={() => {
                setEditItem(null);
                setVisibleForm(false);
                reset(defaultFormValues);
              }}
              backgroundColor="#F5F7FA"
              color="#555555"
              borderColor="#E0E0E0"
            />
          )}
        </form>
      )}
      <div>
        <DataGrid
          columns={addressColumns}
          rows={data}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          loading={tableIsLoading}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20, 30]}
          showToolbar
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "#1A2A38",
              fontWeight: "bold ",
            },
          }}
        />
      </div>
      <div>
        <h2 className="my-8 text-color_primary_500 font-semibold">
          Endereços selecionados para impressão
        </h2>
        <DataGrid columns={printableAddressColumns} rows={selectedAddresses} />

        <div className="max-w-fit  flex gap-4">
          <Button text="Area de impressão" />
          <Button text="Limpar selecionados" />
        </div>
      </div>
    </div>
  );
}
