import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Tab, Tabs } from "@mui/material";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Building2, SlidersHorizontal, BellRing, Pencil, Trash2 } from "lucide-react";

import { db, storage } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useConfirmDialog } from "@/components/ConfimDialog";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { notify } from "@/utils/notify";

// ── Types ──────────────────────────────────────────────────────────────────────

type Carrier = {
  id: string;
  name: string;
  createdAt: Timestamp;
};

type CompanyFormData = {
  name: string;
  street: string;
  district: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  whatsapp: string;
};

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = yup.object({
  name: yup.string().required("*").max(200, "Máximo 200 caracteres"),
  street: yup.string().required("*").max(200, "Máximo 200 caracteres"),
  district: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  city: yup.string().required("*").max(100, "Máximo 100 caracteres"),
  state: yup.string().required("*").max(2, "Use a sigla (ex: SP)"),
  zip: yup.string().required("*").max(20, "Máximo 20 caracteres"),
  phone: yup.string().required("*").max(30, "Máximo 30 caracteres"),
  whatsapp: yup.string().required("*").max(30, "Máximo 30 caracteres"),
});

// ── Placeholder de aba futura ──────────────────────────────────────────────────

function ComingSoonTab({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// ── Tab: Operacional ──────────────────────────────────────────────────────────

function OperacionalTab() {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";
  const { confirm, dialog } = useConfirmDialog();

  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    loadCarriers();
  }, [companyId]);

  async function loadCarriers() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "companies", companyId, "carriers"),
        orderBy("createdAt", "asc")
      );
      const snapshot = await getDocs(q);
      setCarriers(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Carrier, "id">),
        }))
      );
    } catch {
      notify.error("Erro ao carregar transportadoras.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const createdAt = Timestamp.now();
      const docRef = await addDoc(
        collection(db, "companies", companyId, "carriers"),
        { name: trimmed, createdAt }
      );
      setCarriers((prev) => [...prev, { id: docRef.id, name: trimmed, createdAt }]);
      setNewName("");
      notify.success("Transportadora adicionada.");
    } catch {
      notify.error("Erro ao adicionar transportadora.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm(
      "Excluir esta transportadora permanentemente? Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "companies", companyId, "carriers", id));
      setCarriers((prev) => prev.filter((c) => c.id !== id));
      notify.success("Transportadora removida.");
    } catch {
      notify.error("Erro ao remover transportadora.");
    }
  }

  async function handleSaveEdit() {
    const trimmed = editingName.trim();
    if (!trimmed || !editingId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "companies", companyId, "carriers", editingId), {
        name: trimmed,
      });
      setCarriers((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, name: trimmed } : c))
      );
      setEditingId(null);
      notify.success("Transportadora atualizada.");
    } catch {
      notify.error("Erro ao atualizar transportadora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6 max-w-3xl mx-auto">
      {dialog}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Transportadoras
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Lista de transportadoras disponíveis para seleção nos módulos do sistema.
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {carriers.length === 0 && (
              <p className="text-sm text-gray-400 py-2">
                Nenhuma transportadora cadastrada.
              </p>
            )}
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
              >
                {editingId === carrier.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-color_primary_400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="text-xs text-emerald-600 font-medium hover:text-emerald-700 px-2 disabled:opacity-50"
                    >
                      {saving ? "..." : "Salvar"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700">
                      {carrier.name}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(carrier.id);
                        setEditingName(carrier.name);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Renomear"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(carrier.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Remover"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da transportadora"
            className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-color_primary_400"
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <Button text="Adicionar" onClick={handleAdd} isLoading={adding} />
        </div>
      </div>
    </div>
  );
}

// ── Tab: Empresa ───────────────────────────────────────────────────────────────

function EmpresaTab() {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!companyId) return;
    async function load() {
      const snap = await getDoc(doc(db, "companies", companyId));
      if (!snap.exists()) return;
      const data = snap.data();
      setLogoUrl(data.logoUrl ?? null);
      reset({
        name: data.name ?? "",
        street: data.street ?? "",
        district: data.district ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        zip: data.zip ?? "",
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
      });
    }
    load();
  }, [companyId]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setUploadingLogo(true);
    try {
      const storageRef = ref(storage, `companies/${companyId}/logo`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "companies", companyId), { logoUrl: url });
      setLogoUrl(url);
      notify.success("Logo atualizada com sucesso.");
    } catch {
      notify.error("Erro ao fazer upload da logo.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoRemove() {
    if (!companyId || !logoUrl) return;
    setRemovingLogo(true);
    try {
      const storageRef = ref(storage, `companies/${companyId}/logo`);
      await deleteObject(storageRef);
      await updateDoc(doc(db, "companies", companyId), { logoUrl: null });
      setLogoUrl(null);
      notify.success("Logo removida.");
    } catch {
      notify.error("Erro ao remover a logo.");
    } finally {
      setRemovingLogo(false);
    }
  }

  async function onSubmit(data: CompanyFormData) {
    setSavingData(true);
    try {
      await updateDoc(doc(db, "companies", companyId), data);
      notify.success("Dados da empresa atualizados.");
    } catch {
      notify.error("Erro ao salvar os dados.");
    } finally {
      setSavingData(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6 max-w-3xl mx-auto">
      {/* Card: Logo */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Logo da empresa
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Aparece no documento de endereços gerado. Formatos aceitos: PNG, JPG.
        </p>

        <div className="flex items-center gap-6">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo da empresa"
              className="h-20 w-auto max-w-[160px] object-contain border border-gray-200 rounded-lg p-2 bg-gray-50 flex-shrink-0"
            />
          ) : (
            <div className="h-20 w-36 flex-shrink-0 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-xs gap-1">
              <span className="text-lg">🏢</span>
              Sem logo
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleLogoUpload}
          />

          <div className="flex flex-row gap-2 p-2">
            <Button
              text={logoUrl ? "Alterar" : "Enviar"}
              isLoading={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
            />
            {logoUrl && (
              <Button
                text="Remover"
                isLoading={removingLogo}
                onClick={handleLogoRemove}
                backgroundColor="transparent"
                color="#EF4444"
                borderColor="#EF4444"
              />
            )}
          </div>
        </div>
      </div>

      {/* Card: Dados da empresa */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Dados da empresa
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Usados como remetente no documento de endereços gerado.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Input
                id="name"
                labelName="Nome da empresa"
                labelId="name"
                {...register("name")}
                errorMessage={errors.name?.message}
              />
            </div>

            <div className="md:col-span-3">
              <Input
                id="street"
                labelName="Endereço (rua e número)"
                labelId="street"
                {...register("street")}
                errorMessage={errors.street?.message}
              />
            </div>

            <Input
              id="district"
              labelName="Bairro"
              labelId="district"
              {...register("district")}
              errorMessage={errors.district?.message}
            />
            <Input
              id="city"
              labelName="Cidade"
              labelId="city"
              {...register("city")}
              errorMessage={errors.city?.message}
            />
            <Input
              id="state"
              labelName="Estado (UF)"
              labelId="state"
              {...register("state")}
              errorMessage={errors.state?.message}
            />

            <Input
              id="zip"
              labelName="CEP"
              labelId="zip"
              {...register("zip")}
              errorMessage={errors.zip?.message}
            />
            <Input
              id="phone"
              labelName="Telefone"
              labelId="phone"
              {...register("phone")}
              errorMessage={errors.phone?.message}
            />
            <Input
              id="whatsapp"
              labelName="WhatsApp"
              labelId="whatsapp"
              {...register("whatsapp")}
              errorMessage={errors.whatsapp?.message}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-44">
              <Button
                text="Salvar"
                type="submit"
                isLoading={savingData}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function Settings() {
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
          label="Empresa"
          icon={<Building2 size={16} />}
          iconPosition="start"
        />
        <Tab
          label="Operacional"
          icon={<SlidersHorizontal size={16} />}
          iconPosition="start"
        />
        <Tab
          label="Notificações"
          icon={<BellRing size={16} />}
          iconPosition="start"
        />
      </Tabs>

      <div className="mt-6">
        {tab === 0 && <EmpresaTab />}
        {tab === 1 && <OperacionalTab />}
        {tab === 2 && (
          <ComingSoonTab
            title="Notificações"
            description="Alertas automáticos para mercadorias atrasadas e outras notificações. Em breve."
          />
        )}
      </div>
    </div>
  );
}
