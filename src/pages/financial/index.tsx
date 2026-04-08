import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Input from "@/components/Input";
import Button from "@/components/Button";

import { ModalInvoice } from "@/components/ModalInvoice";
import { useConfirmDialog } from "@/components/ConfimDialog";
import LoadingOverlay from "@/components/LoadingOverlay";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";

import { formatCurrencyBRL } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

import { db } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { notify } from "@/utils/notify";
import { List, SquarePen, Trash2 } from "lucide-react";

export type InvoiceFormData = {
  invoiceNumber: string;
  issuer: string;
  emission: string;
  invoiceValue: number;
  observations?: string | null;
};
export type Invoice = InvoiceFormData & {
  id: string;
};
export type SlipForm = {
  ticketNumber: string;
  ticketValue: number;
  maturity: string;
};

export type Slips = SlipForm & {
  id: string;
};

export type SlipsUIComplete = SlipForm & {
  id: string;
  invoiceNumber: string;
  issuer: string;
  idInvoiceReference: string;
};

const defaultFormValues: InvoiceFormData = {
  invoiceNumber: "",
  issuer: "",
  emission: "",
  invoiceValue: 0,
  observations: "",
};

export default function Financial() {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";
  const [dataSlips, setDataSlips] = useState<SlipsUIComplete[]>([]);
  const [tableIsLoading, setTableIsLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();
  const [visibleForm, setVisibleForm] = useState(false);
  const [invoiceSlips, setInvoiceSlips] = useState<Slips[]>([]);
  const [editInvoiceAndSlips, setEditInvoiceAndSlips] =
    useState<SlipsUIComplete | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<Invoice>(
    {} as Invoice
  );
  const [loading, setLoading] = useState(false);
  const [selectedSlipsModal, setSelectedSlipsModal] = useState<Slips[]>([]);
  const [removedSlipIds, setRemovedSlipIds] = useState<string[]>([]);
  const paginationModel = { page: 0, pageSize: 10 };

  const schemaInvoice = yup.object({
    invoiceNumber: yup
      .string()
      .max(20, "Máximo de 20 caracteres")
      .required("*"),
    issuer: yup.string().max(100, "Máximo de 100 caracteres").required("*"),
    emission: yup.string().required("*").test(
      "not-future",
      "Não pode ser uma data futura",
      (value) => {
        const today = new Date().toISOString().split("T")[0];
        return !value || value <= today;
      }
    ),
    invoiceValue: yup.number().typeError("Digite um valor").min(0.01, "Valor deve ser maior que zero").required("*"),
    observations: yup.string().notRequired(),
  });
  const [invoiceValueDisplay, setInvoiceValueDisplay] = useState("");
  const [ticketValueDisplay, setTicketValueDisplay] = useState("");

  const {
    handleSubmit: handleSubmitInvoice,
    watch,
    register: registerInvoice,
    reset: resetInvoice,
    control: invoiceControl,
    formState: { errors: errorsInvoice },
  } = useForm<InvoiceFormData>({
    resolver: yupResolver(schemaInvoice),
    defaultValues: {
      invoiceNumber: "",
      issuer: "",
      emission: "",
      invoiceValue: 0,
      observations: "",
    },
  });
  const invoiceNumber = watch("invoiceNumber");
  const issuer = watch("issuer");
  const emission = watch("emission");
  const invoiceValue = watch("invoiceValue");
  const observations = watch("observations");

  const schemaSlips = yup.object({
    ticketNumber: yup.string().required("*"),
    ticketValue: yup
      .number()
      .typeError("Digite um numero")
      .min(0, "O valor não pode ser negativo")
      .nullable()
      .required("*"),
    maturity: yup.string().required("*").test(
      "not-past",
      "Não pode ser anterior a hoje",
      (value) => {
        const today = new Date().toISOString().split("T")[0];
        return !value || value >= today;
      }
    ),
  });

  const {
    handleSubmit: handleSubmitSlip,
    register: registerSlip,
    reset: resetSlep,
    control: slipControl,
    formState: { errors: errorsSlip },
  } = useForm<SlipForm>({
    resolver: yupResolver(schemaSlips),
    defaultValues: {
      ticketNumber: "",
      ticketValue: 0,
      maturity: "",
    },
  });
  const dataSlipsColumns: GridColDef[] = [
    { field: "issuer", headerName: "Beneficiario", width: 200 },
    { field: "ticketNumber", headerName: "Numero", width: 100 },
    {
      field: "ticketValue",
      headerName: "Valor",
      width: 150,
      renderCell: (params) => (
        <span>{formatCurrencyBRL(Number(params.value))}</span>
      ),
    },
    {
      field: "maturity",
      headerName: "Vencimento",
      width: 150,
      renderCell: (params) => <span>{formatDate(String(params.value))}</span>,
    },
    { field: "invoiceNumber", headerName: "Nota", width: 150 },

    {
      field: "actions",
      headerName: "Ações",
      minWidth: 50,
      renderCell: (params) => {
        return (
          <div className="flex h-full gap-4 items-center">
            <button
              className="text-text_description"
              onClick={() => handleEditInvoiceAndSlips(params.row)}
            >
              <SquarePen />
            </button>
            <button
              className="text-text_description"
              onClick={() => {
                showInvoiceAndSlips(params.row);
                setIsOpenModal(true);
              }}
            >
              <List />
            </button>
          </div>
        );
      },
    },
  ];
  const slipsColumns: GridColDef[] = [
    { field: "ticketNumber", headerName: "Numero", width: 100 },
    {
      field: "ticketValue",
      headerName: "Valor",
      width: 150,
      renderCell: (params) => (
        <span>{formatCurrencyBRL(Number(params.value))}</span>
      ),
    },
    {
      field: "maturity",
      headerName: "Vencimento",
      width: 150,
      renderCell: (params) => <span>{formatDate(String(params.value))}</span>,
    },
    {
      field: "actions",
      headerName: "Ações",
      minWidth: 50,
      renderCell: (params) => {
        return (
          <div className="flex h-full gap-4 items-center">
            <button
              className="text-color_error"
              onClick={() => handleDeleteSlepInState(params.row)}
            >
              <Trash2 />
            </button>
          </div>
        );
      },
    },
  ];

  function addSlepToInvoice(slipFormData: SlipForm) {
    setInvoiceSlips((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...slipFormData },
    ]);
    resetSlep({ ticketNumber: "", ticketValue: 0, maturity: "" });
    setTicketValueDisplay("");
  }
  async function showInvoiceAndSlips(item: SlipsUIComplete) {
    try {
      setLoading(true);
      const invoiceDoc = await getDoc(
        doc(db, "companies", companyId, "invoices", item.idInvoiceReference)
      );

      if (!invoiceDoc.exists()) {
        notify.error("Nota fiscal não encontrada!");
        return;
      }

      const invoiceData = {
        id: invoiceDoc.id,
        ...invoiceDoc.data(),
      } as Invoice;

      setSelectedInvoiceModal(invoiceData);

      const q = query(
        collection(db, "companies", companyId, "slips"),
        where("idInvoiceReference", "==", item.idInvoiceReference)
      );
      const snapshot = await getDocs(q);
      const slips = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as SlipForm),
      }));
      setSelectedSlipsModal(slips);
    } catch (error) {
      notify.error("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  }
  async function handleEditInvoiceAndSlips(item: SlipsUIComplete) {
    try {
      const invoiceDoc = await getDoc(
        doc(db, "companies", companyId, "invoices", item.idInvoiceReference)
      );
      if (!invoiceDoc.exists()) {
        notify.error("Nota fiscal não encontrada!");
        return;
      }

      const invoiceData = invoiceDoc.data() as InvoiceFormData;

      resetInvoice({
        invoiceNumber: invoiceData.invoiceNumber,
        issuer: invoiceData.issuer,
        emission: invoiceData.emission,
        invoiceValue: invoiceData.invoiceValue,
        observations: invoiceData.observations ?? "",
      });
      setInvoiceValueDisplay(formatCurrencyBRL(invoiceData.invoiceValue));

      const q = query(
        collection(db, "companies", companyId, "slips"),
        where("idInvoiceReference", "==", item.idInvoiceReference)
      );
      const snapshot = await getDocs(q);
      const slips = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as SlipForm),
      }));

      setInvoiceSlips(slips);
      setEditInvoiceAndSlips(item);
      setVisibleForm(true);
    } catch (error) {
      console.error(error);
      notify.error("Erro ao carregar dados para edição");
    }
  }

  function handleDeleteSlepInState(row: Slips) {
    setInvoiceSlips((prev) => prev.filter((slep) => slep.id !== row.id));
    if (editInvoiceAndSlips) {
      // Rastreia para deletar no Firestore apenas quando o usuário salvar
      setRemovedSlipIds((prev) => [...prev, row.id]);
    }
  }

  async function registerInvoicesAndBills(dataInvoice: InvoiceFormData) {
    try {
      const confirmed = await confirm(
        "Tem certeza que deseja cadastrar nota e boletos?"
      );
      if (confirmed) {
        setLoading(true);
        const docRefInvoice = await addDoc(collection(db, "companies", companyId, "invoices"), {
          ...dataInvoice,
          created_at: new Date(),
        });

        const invoiceId = docRefInvoice.id;

        const promises = invoiceSlips.map((slep) =>
          setDoc(doc(db, "companies", companyId, "slips", slep.id), {
            ...slep,
            issuer: dataInvoice.issuer,
            idInvoiceReference: invoiceId,
            invoiceNumber: dataInvoice.invoiceNumber,
            created_at: new Date(),
          })
        );
        await Promise.all(promises);
        resetInvoice(defaultFormValues);
        setInvoiceSlips([]);
        setInvoiceValueDisplay("");
        setVisibleForm(false);
        notify.success("Cadastrado com sucesso!");
      }
    } catch (error) {
      notify.error("Erro ao cadastrar, verifique os dados.");
    } finally {
      setLoading(false);
    }
  }
  async function getAllSlips() {
    setTableIsLoading(true);
    try {
      const q = query(collection(db, "companies", companyId, "slips"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => doc.data() as SlipsUIComplete);
      setDataSlips(docs);
    } catch (error) {
      console.error(error);
    } finally {
      setTableIsLoading(false);
    }
  }

  useEffect(() => {
    if (!companyId) return;
    getAllSlips();
  }, [companyId]);

  async function onSubmit(formDataInvoice: InvoiceFormData) {
    if (invoiceSlips.length === 0) {
      notify.error("Adicione ao menos um boleto antes de salvar.");
      return;
    }

    if (invoiceSlips.length > 0) {
      const slipTotal = invoiceSlips.reduce(
        (sum, slip) => sum + slip.ticketValue,
        0
      );
      if (Math.abs(slipTotal - formDataInvoice.invoiceValue) > 0.01) {
        notify.error(
          `Total dos boletos (${formatCurrencyBRL(slipTotal)}) não confere com o valor da nota (${formatCurrencyBRL(formDataInvoice.invoiceValue)})`
        );
        return;
      }
    }

    const payloadInvoice = { ...formDataInvoice };
    if (editInvoiceAndSlips) {
      try {
        setLoading(true);
        const ref = doc(db, "companies", companyId, "invoices", editInvoiceAndSlips.idInvoiceReference);
        await updateDoc(ref, formDataInvoice);

        const q = query(
          collection(db, "companies", companyId, "slips"),
          where(
            "idInvoiceReference",
            "==",
            editInvoiceAndSlips.idInvoiceReference
          )
        );
        const snapshot = await getDocs(q);
        const existingSlipIds = snapshot.docs.map((docSnap) => docSnap.id);

        const newSlips = invoiceSlips.filter(
          (slip) => !existingSlipIds.includes(slip.id)
        );
        const createNewSlep = newSlips.map((slip) =>
          setDoc(doc(db, "companies", companyId, "slips", slip.id), {
            ...slip,
            issuer: formDataInvoice.issuer,
            invoiceNumber: formDataInvoice.invoiceNumber,
            idInvoiceReference: editInvoiceAndSlips.idInvoiceReference,
            created_at: new Date(),
          })
        );

        const updateSleps = snapshot.docs.map((docSnap) =>
          updateDoc(doc(db, "companies", companyId, "slips", docSnap.id), {
            issuer: formDataInvoice.issuer,
            invoiceNumber: formDataInvoice.invoiceNumber,
          })
        );
        const deleteRemoved = removedSlipIds.map((id) =>
          deleteDoc(doc(db, "companies", companyId, "slips", id))
        );
        await Promise.all(createNewSlep);
        await Promise.all(updateSleps);
        await Promise.all(deleteRemoved);
        notify.success("Atualizado com sucesso!");
        resetInvoice(defaultFormValues);
        setInvoiceSlips([]);
        setRemovedSlipIds([]);
        setInvoiceValueDisplay("");
        setVisibleForm(false);
        getAllSlips();
      } catch (error) {
        notify.error("Erro ao atualizar registro");
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        await registerInvoicesAndBills(payloadInvoice);
        await getAllSlips();
      } catch (error) {
        notify.error("Erro ao salvar registro.");
      } finally {
        setLoading(false);
      }
    }

    setEditInvoiceAndSlips(null);
  }
  return (
    <div>
      <div className=" flex text-center justify-between items-end mb-8">
        <h2 className="text-2xl text-color_primary_400 font-bold">
          Notas Fiscais
        </h2>

        {editInvoiceAndSlips ? (
          ""
        ) : (
          <Button
            type="button"
            text={visibleForm ? "Fechar" : "Cadastrar +"}
            onClick={() => setVisibleForm((prev) => !prev)}
          />
        )}

        {dialog}
        <LoadingOverlay open={loading} />
      </div>

      {visibleForm && (
        <form
          onSubmit={handleSubmitInvoice(onSubmit)}
          className="bg-white rounded-md p-6 flex-col flex gap-10 justify-between"
        >
          <div className="flex gap-8">
            <div className="flex-col w-full gap-4 ">
              <div className="flex-col  gap-8 ">
                <h2 className="text-xl font-semibold mb-4">
                  Dados da Nota Fiscal
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="issuer"
                    type="text"
                    labelName="Emitente"
                    labelId="issuer"
                    {...registerInvoice("issuer")}
                    errorMessage={errorsInvoice.issuer?.message}
                  />
                  <Input
                    id="invoiceNumber"
                    type="text"
                    labelName="Nota Fiscal"
                    labelId="invoiceNumber"
                    {...registerInvoice("invoiceNumber")}
                    errorMessage={errorsInvoice.invoiceNumber?.message}
                  />
                  <Input
                    id="emission"
                    type="date"
                    labelName="Data da emissão"
                    labelId="emission"
                    {...registerInvoice("emission")}
                    errorMessage={errorsInvoice.emission?.message}
                  />
                  <Controller
                    name="invoiceValue"
                    control={invoiceControl}
                    render={({ field, fieldState }) => (
                      <Input
                        id="invoiceValue"
                        type="text"
                        inputMode="numeric"
                        labelName="Valor da Nota"
                        labelId="invoiceValue"
                        placeholder="R$ 0,00"
                        value={invoiceValueDisplay}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          const numeric = digits ? parseInt(digits) / 100 : 0;
                          setInvoiceValueDisplay(digits ? formatCurrencyBRL(numeric) : "");
                          field.onChange(numeric);
                        }}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                  <Input
                    id="observations"
                    type="text"
                    labelName="Observações"
                    labelId="observations"
                    {...registerInvoice("observations")}
                    errorMessage={errorsInvoice.observations?.message}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold  border-t pt-8 my-4 ">
                    Boletos
                  </h2>
                  <div className="flex gap-x-4 items-center justify-start">
                    <Input
                      id="ticketNumber"
                      type="text"
                      labelName="Numero do boleto"
                      labelId="ticketNumber"
                      {...registerSlip("ticketNumber")}
                      errorMessage={errorsSlip.ticketNumber?.message}
                    />
                    <Controller
                      name="ticketValue"
                      control={slipControl}
                      render={({ field, fieldState }) => (
                        <Input
                          id="ticketValue"
                          type="text"
                          inputMode="numeric"
                          labelName="Valor"
                          labelId="ticketValue"
                          placeholder="R$ 0,00"
                          value={ticketValueDisplay}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            const numeric = digits ? parseInt(digits) / 100 : 0;
                            setTicketValueDisplay(digits ? formatCurrencyBRL(numeric) : "");
                            field.onChange(numeric);
                          }}
                          errorMessage={fieldState.error?.message}
                        />
                      )}
                    />

                    <Input
                      id="maturity"
                      type="date"
                      labelName="Vencimento"
                      labelId="maturity"
                      {...registerSlip("maturity")}
                      errorMessage={errorsSlip.maturity?.message}
                    />
                    <Button
                      onClick={handleSubmitSlip(addSlepToInvoice)}
                      text="Adicionar"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className=" bg-bg_input_color p-4 h-fit rounded-md gap-10 flex min-w-[500px]">
                <div className="w-60">
                  <h2 className="text-xl mb-4">Resumo</h2>
                  <div className="space-y-4 ">
                    <div className="gap-1">
                      <span className="text-gray-600">Emitente:</span>
                      <span className="font-medium mx-2">{issuer}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Numero da Nota:</span>
                      <span className="font-medium">{invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emissão:</span>
                      <span className="font-medium">
                        {formatDate(emission)}
                      </span>
                    </div>
                    <div className="flex justify-between ">
                      <span className="text-gray-600">Valor Total:</span>
                      <span className="font-medium">
                        {formatCurrencyBRL(invoiceValue)}
                      </span>
                    </div>
                    <div className="gap-1">
                      <span className="text-gray-600">Observação:</span>
                      <span className="font-medium mx-2">{observations}</span>
                    </div>
                    <div className="flex justify-between  border-t pt-4">
                      <span className="text-gray-600">Qtd. Boletos</span>
                      <span className="font-semibold">
                        {invoiceSlips.length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <DataGrid
                    columns={slipsColumns}
                    rows={invoiceSlips}
                    localeText={
                      ptBR.components.MuiDataGrid.defaultProps.localeText
                    }
                    loading={tableIsLoading}
                    hideFooter
                    sx={{
                      backgroundColor: "transparent",
                      "& .MuiDataGrid-columnHeaderTitle": {
                        color: "#1A2A38",
                        fontWeight: "bold ",
                      },
                      "& .MuiDataGrid-cell:focus-within": {
                        outline: "none",
                        boxShadow: "none",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className=" flex justify-end gap-4">
            <Button
              text={editInvoiceAndSlips ? "Atualizar" : "Salvar"}
              type="submit"
            />
            <Button
              onClick={() => {
                resetInvoice(defaultFormValues), setInvoiceSlips([]);
              }}
              backgroundColor="#F5F7FA"
              color="#555555"
              borderColor="#E0E0E0"
              text={"Limpar"}
            />
          </div>
          {editInvoiceAndSlips && (
            <Button
              text="Cancelar edição"
              onClick={() => {
                setEditInvoiceAndSlips(null);
                setVisibleForm(false);
                resetInvoice(defaultFormValues);
                setInvoiceSlips([]);
                setRemovedSlipIds([]);
                setInvoiceValueDisplay("");
              }}
              backgroundColor="transparent"
              color="#555555"
              borderColor="#E0E0E0"
            />
          )}
        </form>
      )}
      <DataGrid
        rows={dataSlips}
        columns={dataSlipsColumns}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        loading={tableIsLoading}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 25, 50]}
        showToolbar
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#1A2A38",
            fontWeight: "bold ",
          },
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
            boxShadow: "none",
          },
        }}
      />
      <ModalInvoice
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        invoiceData={selectedInvoiceModal}
        slipsData={selectedSlipsModal}
        getAllSlips={getAllSlips}
      />
    </div>
  );
}
