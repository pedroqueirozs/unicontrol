import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
  Button as MuiButton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { Trash2 } from "lucide-react";
import dayjs from "dayjs";

import { db } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useConfirmDialog } from "@/components/ConfimDialog";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { notify } from "@/utils/notify";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PendingStatus = "aberta" | "em_andamento" | "resolvida";

type PendingUpdate = {
  id: string;
  text: string;
  createdAt: Timestamp;
};

type CustomerPendingFirestore = {
  clientName: string;
  city: string;
  document: string;
  openedAt: Timestamp;
  status: PendingStatus;
  createdAt: Timestamp;
  updates: PendingUpdate[];
};

type CustomerPendingUI = {
  id: string;
  clientName: string;
  city: string;
  document: string;
  openedAt: string;
  status: PendingStatus;
  createdAt: Timestamp;
  updates: PendingUpdate[];
  lastUpdate: string;
};

// ─── Configurações ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PendingStatus,
  { label: string; color: string; bg: string }
> = {
  aberta: { label: "Aberta", color: "#DC2626", bg: "#FEE2E2" },
  em_andamento: { label: "Em andamento", color: "#D97706", bg: "#FEF3C7" },
  resolvida: { label: "Resolvida", color: "#059669", bg: "#D1FAE5" },
};

const STATUS_OPTIONS: { value: PendingStatus; label: string }[] = [
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "resolvida", label: "Resolvida" },
];

// ─── Schema do formulário de criação ─────────────────────────────────────────

type CreateFormData = {
  clientName: string;
  city: string;
  document: string;
  openedAt: string;
  initialDescription: string;
};

const createSchema = yup.object({
  clientName: yup.string().required("*").max(200, "Máximo 200 caracteres"),
  city: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  document: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  openedAt: yup.string().required("*"),
  initialDescription: yup
    .string()
    .required("*")
    .max(2000, "Máximo 2000 caracteres"),
});

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CustomersPending() {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";
  const { confirm, dialog } = useConfirmDialog();

  const [data, setData] = useState<CustomerPendingUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PendingStatus | "todas">(
    "todas"
  );

  // Modal de criação
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Modal de detalhe
  const [detailItem, setDetailItem] = useState<CustomerPendingUI | null>(null);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [addingUpdate, setAddingUpdate] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: yupResolver(createSchema) });

  // ─── Firestore ──────────────────────────────────────────────────────────────

  async function loadData() {
    if (!companyId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "companies", companyId, "customers_pending"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list: CustomerPendingUI[] = snapshot.docs.map((d) => {
        const raw = d.data() as CustomerPendingFirestore;
        const updates = raw.updates ?? [];
        const lastUpd =
          updates.length > 0
            ? dayjs(updates[updates.length - 1].createdAt.toDate()).format(
                "DD/MM/YYYY HH:mm"
              )
            : "-";
        return {
          id: d.id,
          ...raw,
          openedAt: dayjs(raw.openedAt.toDate()).format("DD/MM/YYYY"),
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

  useEffect(() => {
    loadData();
  }, [companyId]);

  async function onCreateSubmit(formData: CreateFormData) {
    setCreating(true);
    try {
      const now = Timestamp.now();
      const firstUpdate: PendingUpdate = {
        id: crypto.randomUUID(),
        text: formData.initialDescription,
        createdAt: now,
      };
      await addDoc(
        collection(db, "companies", companyId, "customers_pending"),
        {
          clientName: formData.clientName,
          city: formData.city,
          document: formData.document,
          openedAt: Timestamp.fromDate(
            dayjs(formData.openedAt).startOf("day").toDate()
          ),
          status: "aberta" as PendingStatus,
          createdAt: now,
          updates: [firstUpdate],
        }
      );
      notify.success("Pendência criada com sucesso.");
      setCreateOpen(false);
      reset();
      await loadData();
    } catch {
      notify.error("Erro ao criar pendência.");
    } finally {
      setCreating(false);
    }
  }

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
        doc(db, "companies", companyId, "customers_pending", detailItem.id),
        { updates: arrayUnion(newUpdate) }
      );
      const updatedItem: CustomerPendingUI = {
        ...detailItem,
        updates: [...detailItem.updates, newUpdate],
        lastUpdate: dayjs(newUpdate.createdAt.toDate()).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
      setDetailItem(updatedItem);
      setData((prev) =>
        prev.map((item) => (item.id === detailItem.id ? updatedItem : item))
      );
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
        doc(db, "companies", companyId, "customers_pending", detailItem.id),
        { status: newStatus }
      );
      const updatedItem = { ...detailItem, status: newStatus };
      setDetailItem(updatedItem);
      setData((prev) =>
        prev.map((item) => (item.id === detailItem.id ? updatedItem : item))
      );
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
      await deleteDoc(
        doc(db, "companies", companyId, "customers_pending", id)
      );
      setData((prev) => prev.filter((item) => item.id !== id));
      notify.success("Pendência excluída.");
    } catch {
      notify.error("Erro ao excluir pendência.");
    }
  }

  // ─── Tabela ─────────────────────────────────────────────────────────────────

  const filteredData =
    statusFilter === "todas"
      ? data
      : data.filter((item) => item.status === statusFilter);

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
    { field: "clientName", headerName: "Cliente", flex: 1, minWidth: 150 },
    { field: "city", headerName: "Cidade", width: 130 },
    { field: "document", headerName: "Documento", width: 130 },
    { field: "openedAt", headerName: "Abertura", width: 110 },
    {
      field: "lastUpdate",
      headerName: "Última atualização",
      width: 170,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <button
          className="text-red-500 hover:text-red-700 p-1"
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

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {dialog}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-color_primary_400">
          Pendências de Clientes
        </h1>
        <Button
          text="Nova pendência +"
          backgroundColor="#34D399"
          onClick={() => setCreateOpen(true)}
        />
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 mb-4">
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
          onRowClick={(params) =>
            setDetailItem(params.row as CustomerPendingUI)
          }
          sx={{
            cursor: "pointer",
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              color: "#1A2A38",
            },
            "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </div>

      {/* ── Modal: Nova Pendência ─────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          reset();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nova Pendência</DialogTitle>
        <form onSubmit={handleSubmit(onCreateSubmit)}>
          <DialogContent>
            <div className="flex flex-col gap-4 pt-1">
              <Input
                id="clientName"
                type="text"
                labelName="Nome do Cliente"
                labelId="clientName"
                {...register("clientName")}
                errorMessage={errors.clientName?.message}
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
                reset();
              }}
              sx={{ color: "#555" }}
            >
              Cancelar
            </MuiButton>
            <MuiButton
              type="submit"
              disabled={creating}
              variant="contained"
              sx={{
                backgroundColor: "#34D399",
                "&:hover": { backgroundColor: "#45c596" },
              }}
            >
              {creating ? "Salvando..." : "Criar pendência"}
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Modal: Detalhe / Histórico ────────────────────────────────────── */}
      <Dialog
        open={!!detailItem}
        onClose={() => {
          setDetailItem(null);
          setNewUpdateText("");
        }}
        maxWidth="sm"
        fullWidth
      >
        {detailItem && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-color_primary_400 text-lg leading-tight">
                  {detailItem.clientName}
                </span>
                <Select
                  size="small"
                  value={detailItem.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as PendingStatus)
                  }
                  disabled={updatingStatus}
                  sx={{ fontSize: 13, minWidth: 150 }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <p className="text-sm font-normal text-gray-500 mt-1">
                {detailItem.city} · {detailItem.document} · Abertura:{" "}
                {detailItem.openedAt}
              </p>
            </DialogTitle>

            <DialogContent dividers>
              {/* Histórico de atualizações */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Histórico
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {[...detailItem.updates].reverse().map((upd) => (
                  <div
                    key={upd.id}
                    className="bg-gray-50 border border-gray-200 rounded-md p-3"
                  >
                    <p className="text-xs text-gray-400 mb-1">
                      {dayjs(upd.createdAt.toDate()).format(
                        "DD/MM/YYYY [às] HH:mm"
                      )}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {upd.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Campo de nova atualização */}
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
                onClick={() => {
                  setDetailItem(null);
                  setNewUpdateText("");
                }}
                sx={{ color: "#555" }}
              >
                Fechar
              </MuiButton>
              <MuiButton
                onClick={handleAddUpdate}
                disabled={addingUpdate || !newUpdateText.trim()}
                variant="contained"
                sx={{
                  backgroundColor: "#34D399",
                  "&:hover": { backgroundColor: "#45c596" },
                }}
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
