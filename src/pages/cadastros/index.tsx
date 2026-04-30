import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Button as MuiButton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { Pencil, Trash2, Users, Truck } from "lucide-react";

import { db } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useConfirmDialog } from "@/components/ConfimDialog";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { notify } from "@/utils/notify";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Contact = {
  id: string;
  code: string;
  name: string;
  cnpj: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  createdAt: Timestamp;
};

// ── Máscara CNPJ / CPF ────────────────────────────────────────────────────────

function formatCnpjCpf(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = yup.object({
  name: yup.string().required("*").max(200, "Máximo 200 caracteres"),
  cnpj: yup.string().required("*").max(20, "Máximo 20 caracteres"),
  street: yup.string().required("*").max(200, "Máximo 200 caracteres"),
  number: yup.string().required("*").max(20, "Máximo 20 caracteres"),
  complement: yup.string().max(100, "Máximo 100 caracteres").default(""),
  neighborhood: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  city: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  state: yup.string().required("*").max(2, "Use a sigla (ex: SP)"),
  zipCode: yup.string().max(10, "Máximo 10 caracteres").default(""),
  phone: yup.string().max(30, "Máximo 30 caracteres").default(""),
  email: yup
    .string()
    .email("E-mail inválido")
    .max(100, "Máximo 100 caracteres")
    .default(""),
});

type ContactFormData = yup.InferType<typeof schema>;

// ── Tab genérica (Clientes / Fornecedores) ────────────────────────────────────

interface ContactsTabProps {
  collectionName: "clients" | "suppliers";
  singularLabel: string;
}

function ContactsTab({ collectionName, singularLabel }: ContactsTabProps) {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";
  const { confirm, dialog } = useConfirmDialog();

  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: yupResolver(schema) });

  // ── Firestore ───────────────────────────────────────────────────────────────

  async function loadData() {
    if (!companyId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "companies", companyId, collectionName),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      setData(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Contact, "id">),
        }))
      );
    } catch {
      notify.error(`Erro ao carregar ${singularLabel.toLowerCase()}s.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [companyId, collectionName]);

  // ── Geração de código automático ───────────────────────────────────────────

  function generateNextCode(): string {
    let max = 0;
    data.forEach((c) => {
      const num = parseInt(c.code.replace(/\D/g, ""), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    const prefix = collectionName === "clients" ? "C" : "F";
    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
  }

  // ── Handlers de modal ───────────────────────────────────────────────────────

  function openCreate() {
    setEditingContact(null);
    reset({
      name: "",
      cnpj: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
    });
    setModalOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditingContact(contact);
    reset({
      name: contact.name,
      cnpj: contact.cnpj ?? "",
      street: contact.street,
      number: contact.number,
      complement: contact.complement ?? "",
      neighborhood: contact.neighborhood,
      city: contact.city,
      state: contact.state,
      zipCode: contact.zipCode ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
    });
    setModalOpen(true);
  }

  async function onSubmit(formData: ContactFormData) {
    setSaving(true);
    try {
      if (editingContact) {
        await updateDoc(
          doc(db, "companies", companyId, collectionName, editingContact.id),
          { ...formData }
        );
        setData((prev) =>
          prev
            .map((c) =>
              c.id === editingContact.id ? { ...c, ...formData } : c
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        notify.success(`${singularLabel} atualizado com sucesso.`);
      } else {
        const now = Timestamp.now();
        const code = generateNextCode();
        const docRef = await addDoc(
          collection(db, "companies", companyId, collectionName),
          { ...formData, code, createdAt: now }
        );
        setData((prev) =>
          [...prev, { id: docRef.id, ...formData, code, createdAt: now }].sort(
            (a, b) => a.name.localeCompare(b.name)
          )
        );
        notify.success(`${singularLabel} cadastrado com sucesso.`);
      }
      setModalOpen(false);
    } catch {
      notify.error(`Erro ao salvar ${singularLabel.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm(
      `Excluir este ${singularLabel.toLowerCase()} permanentemente? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "companies", companyId, collectionName, id));
      setData((prev) => prev.filter((c) => c.id !== id));
      notify.success(`${singularLabel} excluído.`);
    } catch {
      notify.error(`Erro ao excluir ${singularLabel.toLowerCase()}.`);
    }
  }

  // ── Filtro de busca ─────────────────────────────────────────────────────────

  const filtered = search.trim()
    ? data.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.cnpj ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : data;

  // ── Colunas ─────────────────────────────────────────────────────────────────

  const columns: GridColDef[] = [
    { field: "code", headerName: "Código", width: 110 },
    {
      field: "name",
      headerName: "Nome / Razão Social",
      flex: 1,
      minWidth: 180,
    },
    { field: "cnpj", headerName: "CNPJ / CPF", width: 160 },
    { field: "city", headerName: "Cidade", width: 130 },
    { field: "phone", headerName: "Telefone", width: 140 },
    {
      field: "actions",
      headerName: "Ações",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-1">
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(params.row as Contact);
            }}
          >
            <Pencil size={17} />
          </button>
          <button
            className="text-red-400 hover:text-red-600 p-1"
            title="Excluir"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
          >
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="py-6">
      {dialog}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CNPJ..."
          className="flex-1 max-w-sm text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-color_primary_400"
        />
        <div className="w-48">
          <Button
            text={`Novo ${singularLabel}`}
            backgroundColor="#34D399"
            onClick={openCreate}
          />
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={loading}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              color: "#1A2A38",
            },
            "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </div>

      {/* ── Modal: Criar / Editar ──────────────────────────────────────────── */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingContact
            ? `Editar ${singularLabel}`
            : `Novo ${singularLabel}`}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <div className="flex flex-col gap-4 pt-1">
              {/* Código (read-only no edit) + CNPJ */}
              {editingContact && (
                <p className="text-xs text-gray-400">
                  Código:{" "}
                  <span className="font-mono font-semibold text-gray-600">
                    {editingContact.code}
                  </span>
                </p>
              )}
              <Input
                id="cnpj"
                labelName="CNPJ / CPF"
                labelId="cnpj"
                {...register("cnpj")}
                onChange={(e) =>
                  setValue("cnpj", formatCnpjCpf(e.target.value))
                }
                errorMessage={errors.cnpj?.message}
              />

              {/* Nome */}
              <Input
                id="name"
                labelName="Nome / Razão Social"
                labelId="name"
                {...register("name")}
                errorMessage={errors.name?.message}
              />

              {/* Logradouro + Número */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    id="street"
                    labelName="Logradouro"
                    labelId="street"
                    {...register("street")}
                    errorMessage={errors.street?.message}
                  />
                </div>
                <Input
                  id="number"
                  labelName="Número"
                  labelId="number"
                  {...register("number")}
                  errorMessage={errors.number?.message}
                />
              </div>

              {/* Complemento + Bairro */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="complement"
                  labelName="Complemento"
                  labelId="complement"
                  {...register("complement")}
                  errorMessage={errors.complement?.message}
                />
                <Input
                  id="neighborhood"
                  labelName="Bairro"
                  labelId="neighborhood"
                  {...register("neighborhood")}
                  errorMessage={errors.neighborhood?.message}
                />
              </div>

              {/* Cidade + UF */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    id="city"
                    labelName="Cidade"
                    labelId="city"
                    {...register("city")}
                    errorMessage={errors.city?.message}
                  />
                </div>
                <Input
                  id="state"
                  labelName="UF"
                  labelId="state"
                  {...register("state")}
                  errorMessage={errors.state?.message}
                />
              </div>

              {/* CEP + Telefone */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="zipCode"
                  labelName="CEP"
                  labelId="zipCode"
                  {...register("zipCode")}
                  errorMessage={errors.zipCode?.message}
                />
                <Input
                  id="phone"
                  labelName="Telefone"
                  labelId="phone"
                  {...register("phone")}
                  errorMessage={errors.phone?.message}
                />
              </div>

              {/* E-mail */}
              <Input
                id="email"
                type="email"
                labelName="E-mail"
                labelId="email"
                {...register("email")}
                errorMessage={errors.email?.message}
              />
            </div>
          </DialogContent>

          <DialogActions>
            <MuiButton onClick={() => setModalOpen(false)} sx={{ color: "#555" }}>
              Cancelar
            </MuiButton>
            <MuiButton
              type="submit"
              disabled={saving}
              variant="contained"
              sx={{
                backgroundColor: "#34D399",
                "&:hover": { backgroundColor: "#45c596" },
              }}
            >
              {saving
                ? "Salvando..."
                : editingContact
                  ? "Salvar alterações"
                  : `Cadastrar`}
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function Cadastros() {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: "1px solid #e5e7eb",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
          "& .Mui-selected": { color: "#1A2A38" },
          "& .MuiTabs-indicator": { backgroundColor: "#1A2A38" },
        }}
      >
        <Tab
          label="Clientes"
          icon={<Users size={16} />}
          iconPosition="start"
        />
        <Tab
          label="Fornecedores"
          icon={<Truck size={16} />}
          iconPosition="start"
        />
      </Tabs>

      <div className="mt-4">
        {tab === 0 && (
          <ContactsTab collectionName="clients" singularLabel="Cliente" />
        )}
        {tab === 1 && (
          <ContactsTab collectionName="suppliers" singularLabel="Fornecedor" />
        )}
      </div>
    </div>
  );
}
