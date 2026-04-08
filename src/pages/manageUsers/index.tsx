import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
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
import { Copy, Trash2 } from "lucide-react";

import { db } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/context/auth";
import { useConfirmDialog } from "@/components/ConfimDialog";
import Button from "@/components/Button";
import { notify } from "@/utils/notify";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  expedicao: "Expedição",
  vendas: "Vendas",
};

type Member = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
};

export default function ManageUsers() {
  const { userData, authed } = useAuth();
  const { confirm, dialog } = useConfirmDialog();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<UserRole>("expedicao");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  async function loadMembers() {
    if (!userData?.companyId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("companyId", "==", userData.companyId)
      );
      const snapshot = await getDocs(q);
      const list: Member[] = snapshot.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<Member, "uid">),
      }));
      setMembers(list);
    } catch (err) {
      console.error("Erro ao carregar membros:", err);
      notify.error("Erro ao carregar membros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [userData?.companyId]);

  async function handleRoleChange(uid: string, newRole: UserRole) {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.uid === uid ? { ...m, role: newRole } : m))
      );
      notify.success("Cargo atualizado com sucesso.");
    } catch {
      notify.error("Erro ao atualizar cargo.");
    }
  }

  async function handleRemove(uid: string, name: string) {
    const confirmed = await confirm(
      `Remover "${name}" da equipe? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setMembers((prev) => prev.filter((m) => m.uid !== uid));
      notify.success("Membro removido com sucesso.");
    } catch {
      notify.error("Erro ao remover membro.");
    }
  }

  async function handleGenerateInvite() {
    if (!userData?.companyId) return;
    setInviteLoading(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      await setDoc(doc(db, "invites", token), {
        companyId: userData.companyId,
        role: inviteRole,
        expiresAt,
        used: false,
        createdAt: Timestamp.now(),
      });
      const link = `${window.location.origin}/invite?token=${token}`;
      setGeneratedLink(link);
    } catch {
      notify.error("Erro ao gerar convite.");
    } finally {
      setInviteLoading(false);
    }
  }

  function handleCopyLink() {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    notify.success("Link copiado!");
  }

  function handleCloseInviteDialog() {
    setInviteOpen(false);
    setGeneratedLink(null);
    setInviteRole("expedicao");
  }

  // uid do admin logado, para impedir que ele se remova ou altere o próprio cargo
  const currentUid =
    authed && typeof authed === "object" ? authed.uid : null;

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "email",
      headerName: "E-mail",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "role",
      headerName: "Cargo",
      width: 200,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.role}
          onChange={(e) =>
            handleRoleChange(params.row.uid, e.target.value as UserRole)
          }
          disabled={params.row.uid === currentUid}
          sx={{ fontSize: 14, width: "100%" }}
        >
          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
            ([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            )
          )}
        </Select>
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      sortable: false,
      renderCell: (params) =>
        params.row.uid === currentUid ? (
          <span className="text-sm text-gray-400 italic">Você</span>
        ) : (
          <button
            className="text-red-500 hover:text-red-700 p-1"
            onClick={() => handleRemove(params.row.uid, params.row.name)}
            title="Remover membro"
          >
            <Trash2 size={18} />
          </button>
        ),
    },
  ];

  return (
    <div>
      {dialog}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-color_primary_400">
          Membros da equipe
        </h1>
        <Button
          text="Convidar membro +"
          backgroundColor="#34D399"
          onClick={() => setInviteOpen(true)}
        />
      </div>

      <div style={{ width: "100%" }}>
        <DataGrid
          rows={members}
          columns={columns}
          getRowId={(row) => row.uid}
          loading={loading}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          disableRowSelectionOnClick
          sx={{ height: "auto" }}
        />
      </div>

      {/* Dialog de convite */}
      <Dialog
        open={inviteOpen}
        onClose={handleCloseInviteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Convidar novo membro</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Selecione o cargo do novo membro:
              </p>
              <Select
                fullWidth
                size="small"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                disabled={!!generatedLink}
              >
                {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
                  ([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  )
                )}
              </Select>
            </div>

            {generatedLink && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-500 mb-1">
                  Link do convite (válido por 7 dias):
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-800 break-all flex-1">
                    {generatedLink}
                  </p>
                  <button
                    className="text-emerald-600 hover:text-emerald-800 shrink-0"
                    onClick={handleCopyLink}
                    title="Copiar link"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleCloseInviteDialog} sx={{ color: "#555" }}>
            Fechar
          </MuiButton>
          {!generatedLink && (
            <MuiButton
              onClick={handleGenerateInvite}
              disabled={inviteLoading}
              variant="contained"
              sx={{
                backgroundColor: "#34D399",
                "&:hover": { backgroundColor: "#45c596" },
              }}
            >
              {inviteLoading ? "Gerando..." : "Gerar link"}
            </MuiButton>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
