import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import {
  addDoc,
  arrayUnion,
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
  MenuItem,
  Select,
  Tab,
  Tabs,
  Button as MuiButton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { AlertCircle, Search, Trash2, Users, X } from "lucide-react";

import { db } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useConfirmDialog } from "@/components/ConfimDialog";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { notify } from "@/utils/notify";

// ── Tipos compartilhados ──────────────────────────────────────────────────────

type PendingStatus = "aberta" | "em_andamento" | "resolvida";

type PendingUpdate = {
  id: string;
  text: string;
  createdAt: Timestamp;
};

type PendingFirestore = {
  name: string;
  city: string;
  document: string;
  openedAt: Timestamp;
  status: PendingStatus;
  createdAt: Timestamp;
  updates: PendingUpdate[];
  clientId?: string;
  clientCode?: string;
  supplierId?: string;
  supplierCode?: string;
};

type PendingUI = {
  id: string;
  name: string;
  city: string;
  document: string;
  openedAt: string;
  status: PendingStatus;
  createdAt: Timestamp;
  updates: PendingUpdate[];
  lastUpdate: string;
};

type ContactRecord = {
  id: string;
  code: string;
  cnpj: string;
  name: string;
  city: string;
  state: string;
};

// ── Configurações de status ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<PendingStatus, { label: string; color: string; bg: string }> = {
  aberta: { label: "Aberta", color: "#DC2626", bg: "#FEE2E2" },
  em_andamento: { label: "Em andamento", color: "#D97706", bg: "#FEF3C7" },
  resolvida: { label: "Resolvida", color: "#059669", bg: "#D1FAE5" },
};

const STATUS_OPTIONS: { value: PendingStatus; label: string }[] = [
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "resolvida", label: "Resolvida" },
];

// ── Schema do formulário ──────────────────────────────────────────────────────

const createSchema = yup.object({
  name: yup.string().required("*").max(200, "Máximo 200 caracteres"),
  city: yup.string().max(100, "Máximo 100 caracteres").default(""),
  document: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  openedAt: yup.string().required("*"),
  initialDescription: yup.string().required("*").max(2000, "Máximo 2000 caracteres"),
});

type CreateFormData = yup.InferType<typeof createSchema>;

function getDefaultValues(): CreateFormData {
  return {
    name: "",
    city: "",
    document: "",
    openedAt: dayjs().format("YYYY-MM-DD"),
    initialDescription: "",
  };
}

// ── Tab genérica (Clientes / Fornecedores) ────────────────────────────────────

interface PendingTabProps {
  collectionName: "customers_pending" | "suppliers_pending";
  contactCollection: "clients" | "suppliers";
  idField: "clientId" | "supplierId";
  codeField: "clientCode" | "supplierCode";
  nameLabel: string;
  columnLabel: string;
}

function PendingTab({
  collectionName,
  contactCollection,
  idField,
  codeField,
  nameLabel,
  columnLabel,
}: PendingTabProps) {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";
  const { confirm, dialog } = useConfirmDialog();

  const [data, setData] = useState<PendingUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PendingStatus | "todas">("todas");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [detailItem, setDetailItem] = useState<PendingUI | null>(null);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [addingUpdate, setAddingUpdate] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // busca de contato
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactRecord | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(createSchema),
    defaultValues: getDefaultValues(),
  });

  // ── Carrega dados ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!companyId) return;
    loadData();
    loadContacts();
  }, [companyId, collectionName]);

  async function loadData() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "companies", companyId, collectionName),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list: PendingUI[] = snapshot.docs.map((d) => {
        const raw = d.data() as PendingFirestore;
        const updates = raw.updates ?? [];
        const lastUpd =
          updates.length > 0
            ? dayjs(updates[updates.length - 1].createdAt.toDate()).format("DD/MM/YYYY HH:mm")
            : "-";
        return {
          id: d.id,
          name: raw.name,
          city: raw.city ?? "",
          document: raw.document,
          openedAt: dayjs(raw.openedAt.toDate()).format("DD/MM/YYYY"),
          status: raw.status,
          createdAt: raw.createdAt,
          updates,
          lastUpdate: lastUpd,
        };
      });
      setData(list);
    } catch {
      notify.error("Erro ao carregar pendências.");
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts() {
    try {
      const q = query(
        collection(db, "companies", companyId, contactCollection),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      setContacts(
        snapshot.docs.map((d) => {
          const raw = d.data() as { code: string; cnpj: string; name: string; city: string; state: string };
          return { id: d.id, code: raw.code, cnpj: raw.cnpj ?? "", name: raw.name, city: raw.city, state: raw.state };
        })
      );
    } catch {
      // silencioso — busca é opcional
    }
  }

  // ── Fecha dropdown ao clicar fora ───────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Busca ───────────────────────────────────────────────────────────────────

  const trimmed = contactSearch.trim().toLowerCase();
  const searchResults =
    trimmed.length >= 1
      ? contacts
          .filter(
            (c) =>
              c.name.toLowerCase().includes(trimmed) ||
              (c.cnpj ?? "").toLowerCase().includes(trimmed)
          )
          .slice(0, 8)
      : [];

  function handleSelectContact(contact: ContactRecord) {
    setSelectedContact(contact);
    setValue("name", contact.name);
    setValue("city", contact.city);
    setContactSearch("");
    setShowResults(false);
  }

  function handleClearContact() {
    setSelectedContact(null);
  }

  // ── Abrir modal de criação ──────────────────────────────────────────────────

  function openCreate() {
    setSelectedContact(null);
    setContactSearch("");
    reset(getDefaultValues());
    setCreateOpen(true);
  }

  // ── Submit criação ──────────────────────────────────────────────────────────

  async function onCreateSubmit(formData: CreateFormData) {
    setCreating(true);
    try {
      const now = Timestamp.now();
      const firstUpdate: PendingUpdate = {
        id: crypto.randomUUID(),
        text: formData.initialDescription,
        createdAt: now,
      };
      await addDoc(collection(db, "companies", companyId, collectionName), {
        name: formData.name,
        city: formData.city ?? "",
        document: formData.document,
        openedAt: Timestamp.fromDate(dayjs(formData.openedAt).startOf("day").toDate()),
        status: "aberta" as PendingStatus,
        createdAt: now,
        updates: [firstUpdate],
        ...(selectedContact && {
          [idField]: selectedContact.id,
          [codeField]: selectedContact.code,
        }),
      });
      notify.success("Pendência criada com sucesso.");
      setCreateOpen(false);
      setSelectedContact(null);
      reset(getDefaultValues());
      await loadData();
    } catch {
      notify.error("Erro ao criar pendência.");
    } finally {
      setCreating(false);
    }
  }

  // ── Atualização e status ────────────────────────────────────────────────────

  async function handleAddUpdate() {
    if (!detailItem || !newUpdateText.trim()) return;
    setAddingUpdate(true);
    try {
      const newUpdate: PendingUpdate = {
        id: crypto.randomUUID(),
        text: newUpdateText.trim(),
        createdAt: Timestamp.now(),
      };
      await updateDoc(
        doc(db, "companies", companyId, collectionName, detailItem.id),
        { updates: arrayUnion(newUpdate) }
      );
      const updatedItem: PendingUI = {
        ...detailItem,
        updates: [...detailItem.updates, newUpdate],
        lastUpdate: dayjs(newUpdate.createdAt.toDate()).format("DD/MM/YYYY HH:mm"),
      };
      setDetailItem(updatedItem);
      setData((prev) => prev.map((item) => (item.id === detailItem.id ? updatedItem : item)));
      setNewUpdateText("");
      notify.success("Atualização adicionada.");
    } catch {
      notify.error("Erro ao adicionar atualização.");
    } finally {
      setAddingUpdate(false);
    }
  }

  async function handleStatusChange(newStatus: PendingStatus) {
    if (!detailItem) return;
    setUpdatingStatus(true);
    try {
      await updateDoc(
        doc(db, "companies", companyId, collectionName, detailItem.id),
        { status: newStatus }
      );
      const updatedItem = { ...detailItem, status: newStatus };
      setDetailItem(updatedItem);
      setData((prev) => prev.map((item) => (item.id === detailItem.id ? updatedItem : item)));
      notify.success("Status atualizado.");
    } catch {
      notify.error("Erro ao atualizar status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm(
      "Excluir esta pendência permanentemente? Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "companies", companyId, collectionName, id));
      setData((prev) => prev.filter((item) => item.id !== id));
      notify.success("Pendência excluída.");
    } catch {
      notify.error("Erro ao excluir pendência.");
    }
  }

  // ── Tabela ──────────────────────────────────────────────────────────────────

  const filteredData =
    statusFilter === "todas" ? data : data.filter((item) => item.status === statusFilter);

  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const cfg = STATUS_CONFIG[params.value as PendingStatus];
        return (
          <span
            style={{
              backgroundColor: cfg.bg,
              color: cfg.color,
              fontWeight: 600,
              fontSize: 12,
              padding: "2px 10px",
              borderRadius: 12,
              whiteSpace: "nowrap",
            }}
          >
            {cfg.label}
          </span>
        );
      },
    },
    { field: "name", headerName: columnLabel, flex: 1, minWidth: 150 },
    { field: "city", headerName: "Cidade", width: 130 },
    { field: "document", headerName: "Documento", width: 140 },
    { field: "openedAt", headerName: "Abertura", width: 110 },
    { field: "lastUpdate", headerName: "Última atualização", width: 170 },
    {
      field: "actions",
      headerName: "Ações",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <button
          className="text-red-400 hover:text-red-600 p-1"
          title="Excluir pendência"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(params.row.id);
          }}
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="py-4">
      {dialog}

      {/* Header da tab */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "todas", label: "Todas" },
              { key: "aberta", label: "Abertas" },
              { key: "em_andamento", label: "Em andamento" },
              { key: "resolvida", label: "Resolvidas" },
            ] as { key: PendingStatus | "todas"; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                statusFilter === f.key
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="w-36">
          <Button text="Criar" backgroundColor="#34D399" onClick={openCreate} />
        </div>
      </div>

      {/* Tabela */}
      <div style={{ width: "100%" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          onRowClick={(params) => setDetailItem(params.row as PendingUI)}
          sx={{
            cursor: "pointer",
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold", color: "#1A2A38" },
            "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </div>

      {/* ── Modal: Nova Pendência ──────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setSelectedContact(null);
          setContactSearch("");
          reset(getDefaultValues());
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nova Pendência — {columnLabel}</DialogTitle>

        <form onSubmit={handleSubmit(onCreateSubmit)}>
          <DialogContent>
            <div className="flex flex-col gap-4 pt-1">

              {/* Busca no cadastro */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Buscar no cadastro{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </p>

                {selectedContact ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                      <span className="text-sm font-semibold text-blue-800">
                        {selectedContact.name}
                      </span>
                      <span className="text-xs text-blue-400">#{selectedContact.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearContact}
                      className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs"
                    >
                      <X size={13} /> limpar
                    </button>
                  </div>
                ) : (
                  <div ref={searchRef} className="relative">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white px-3 gap-2 focus-within:ring-1 focus-within:ring-color_primary_400">
                      <Search size={14} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => {
                          setContactSearch(e.target.value);
                          setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        placeholder={`Nome ou código do ${columnLabel.toLowerCase()}...`}
                        className="flex-1 py-2 text-sm bg-transparent outline-none"
                      />
                      {contactSearch && (
                        <button
                          type="button"
                          onClick={() => { setContactSearch(""); setShowResults(false); }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {showResults && searchResults.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        {searchResults.map((contact) => (
                          <li
                            key={contact.id}
                            onMouseDown={() => handleSelectContact(contact)}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-800">
                                {contact.name}
                              </span>
                              {contact.cnpj && (
                                <span className="text-xs text-gray-400 ml-2">
                                  {contact.cnpj}
                                </span>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">
                                {contact.city}{contact.state ? ` - ${contact.state}` : ""}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {showResults && trimmed.length >= 1 && searchResults.length === 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5">
                        <p className="text-sm text-gray-400">
                          Nenhum resultado para "{contactSearch}".
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Campos do formulário */}
              <Input
                id="name"
                type="text"
                labelName={nameLabel}
                labelId="name"
                {...register("name")}
                errorMessage={errors.name?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="city"
                  type="text"
                  labelName="Cidade"
                  labelId="city"
                  {...register("city")}
                  errorMessage={errors.city?.message}
                />
                <Input
                  id="document"
                  type="text"
                  labelName="Documento / NF"
                  labelId="document"
                  {...register("document")}
                  errorMessage={errors.document?.message}
                />
              </div>

              <Input
                id="openedAt"
                type="date"
                labelName="Data de abertura"
                labelId="openedAt"
                {...register("openedAt")}
                errorMessage={errors.openedAt?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição inicial <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-color_primary_400"
                  rows={4}
                  placeholder="Descreva o problema..."
                  {...register("initialDescription")}
                />
                {errors.initialDescription && (
                  <span className="text-red-500 text-xs">
                    {errors.initialDescription.message}
                  </span>
                )}
              </div>
            </div>
          </DialogContent>

          <DialogActions>
            <MuiButton
              onClick={() => {
                setCreateOpen(false);
                setSelectedContact(null);
                setContactSearch("");
                reset(getDefaultValues());
              }}
              sx={{ color: "#555" }}
            >
              Cancelar
            </MuiButton>
            <MuiButton
              type="submit"
              disabled={creating}
              variant="contained"
              sx={{ backgroundColor: "#34D399", "&:hover": { backgroundColor: "#45c596" } }}
            >
              {creating ? "Salvando..." : "Criar pendência"}
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Modal: Detalhe / Histórico ─────────────────────────────────────── */}
      <Dialog
        open={!!detailItem}
        onClose={() => { setDetailItem(null); setNewUpdateText(""); }}
        maxWidth="sm"
        fullWidth
      >
        {detailItem && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-color_primary_400 text-lg leading-tight">
                    {detailItem.name}
                  </span>
                  {detailItem.city && (
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      {detailItem.city}
                    </span>
                  )}
                </div>
                <Select
                  size="small"
                  value={detailItem.status}
                  onChange={(e) => handleStatusChange(e.target.value as PendingStatus)}
                  disabled={updatingStatus}
                  sx={{ fontSize: 13, minWidth: 150, flexShrink: 0 }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <p className="text-sm font-normal text-gray-500 mt-1">
                {detailItem.document} · Abertura: {detailItem.openedAt}
              </p>
            </DialogTitle>

            <DialogContent dividers>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Histórico
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {[...detailItem.updates].reverse().map((upd) => (
                  <div key={upd.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-400 mb-1">
                      {dayjs(upd.createdAt.toDate()).format("DD/MM/YYYY [às] HH:mm")}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{upd.text}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Nova atualização
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-color_primary_400"
                  rows={3}
                  placeholder="Descreva o que aconteceu..."
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                />
              </div>
            </DialogContent>

            <DialogActions>
              <MuiButton
                onClick={() => { setDetailItem(null); setNewUpdateText(""); }}
                sx={{ color: "#555" }}
              >
                Fechar
              </MuiButton>
              <MuiButton
                onClick={handleAddUpdate}
                disabled={addingUpdate || !newUpdateText.trim()}
                variant="contained"
                sx={{ backgroundColor: "#34D399", "&:hover": { backgroundColor: "#45c596" } }}
              >
                {addingUpdate ? "Salvando..." : "Adicionar"}
              </MuiButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function Pendencias() {
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
        <Tab label="Clientes" icon={<Users size={16} />} iconPosition="start" />
        <Tab label="Fornecedores" icon={<AlertCircle size={16} />} iconPosition="start" />
      </Tabs>

      <div className="mt-2">
        {tab === 0 && (
          <PendingTab
            collectionName="customers_pending"
            contactCollection="clients"
            idField="clientId"
            codeField="clientCode"
            nameLabel="Nome do Cliente"
            columnLabel="Cliente"
          />
        )}
        {tab === 1 && (
          <PendingTab
            collectionName="suppliers_pending"
            contactCollection="suppliers"
            idField="supplierId"
            codeField="supplierCode"
            nameLabel="Nome do Fornecedor"
            columnLabel="Fornecedor"
          />
        )}
      </div>
    </div>
  );
}
