import { useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { getBytes, getMetadata, ref as storageRef } from "firebase/storage";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { CircleMinus, CirclePlus, Search, Trash2, X } from "lucide-react";

import { db, storage } from "@/services/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { generateDocx, PrintQueueItem, CompanySender } from "@/utils/DocxGenerator";
import Button from "@/components/Button";
import { notify } from "@/utils/notify";

// ── Tipos internos ────────────────────────────────────────────────────────────

type ContactRecord = {
  id: string;
  code: string;
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  sourceType: "client" | "supplier";
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function Addresses() {
  const { userData } = useAuth();
  const companyId = userData?.companyId ?? "";

  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [queue, setQueue] = useState<PrintQueueItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Carrega clientes e fornecedores na memória ──────────────────────────────

  useEffect(() => {
    if (!companyId) return;

    async function loadContacts() {
      setLoadingContacts(true);
      try {
        const [clientsSnap, suppliersSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "companies", companyId, "clients"),
              orderBy("name", "asc")
            )
          ),
          getDocs(
            query(
              collection(db, "companies", companyId, "suppliers"),
              orderBy("name", "asc")
            )
          ),
        ]);

        const clients: ContactRecord[] = clientsSnap.docs.map((d) => ({
          id: d.id,
          sourceType: "client" as const,
          ...(d.data() as Omit<ContactRecord, "id" | "sourceType">),
        }));

        const suppliers: ContactRecord[] = suppliersSnap.docs.map((d) => ({
          id: d.id,
          sourceType: "supplier" as const,
          ...(d.data() as Omit<ContactRecord, "id" | "sourceType">),
        }));

        setContacts(
          [...clients, ...suppliers].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      } catch {
        notify.error("Erro ao carregar cadastros.");
      } finally {
        setLoadingContacts(false);
      }
    }

    loadContacts();
  }, [companyId]);

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

  const trimmed = searchQuery.trim().toLowerCase();
  const searchResults =
    trimmed.length >= 1
      ? contacts
          .filter(
            (c) =>
              c.name.toLowerCase().includes(trimmed) ||
              c.code.toLowerCase().includes(trimmed)
          )
          .slice(0, 8)
      : [];

  // ── Fila de impressão ───────────────────────────────────────────────────────

  function addToQueue(contact: ContactRecord) {
    setQueue((prev) => {
      const existing = prev.find((item) => item.id === contact.id);
      if (existing) {
        return prev.map((item) =>
          item.id === contact.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: contact.id,
          sourceType: contact.sourceType,
          name: contact.name,
          code: contact.code,
          street: contact.street,
          number: contact.number,
          complement: contact.complement ?? "",
          neighborhood: contact.neighborhood,
          city: contact.city,
          state: contact.state,
          zipCode: contact.zipCode ?? "",
          amount: 1,
        },
      ];
    });
    setSearchQuery("");
    setShowResults(false);
  }

  function increaseAmount(id: string) {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, amount: item.amount + 1 } : item
      )
    );
  }

  function decreaseAmount(id: string) {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id && item.amount > 1
          ? { ...item, amount: item.amount - 1 }
          : item
      )
    );
  }

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  // ── Geração do .docx ────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (queue.length === 0) {
      notify.error("Nenhum endereço na fila de impressão.");
      return;
    }

    setIsGenerating(true);
    try {
      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (!companyDoc.exists()) {
        notify.error("Dados da empresa não encontrados.");
        return;
      }

      const company = companyDoc.data() as CompanySender;

      let logoBuffer: ArrayBuffer | null = null;
      let logoType: "png" | "jpg" = "png";

      if (company.logoUrl) {
        try {
          const logoRef = storageRef(storage, `companies/${companyId}/logo`);
          const [buffer, metadata] = await Promise.all([
            getBytes(logoRef),
            getMetadata(logoRef),
          ]);
          logoBuffer = buffer;
          const ct = metadata.contentType ?? "";
          if (ct.includes("jpeg") || ct.includes("jpg")) logoType = "jpg";
        } catch {
          // logo não encontrada, gera sem ela
        }
      }

      await generateDocx(queue, company, logoBuffer, logoType);
      notify.success("Endereços gerados com sucesso!");
    } catch {
      notify.error("Erro ao gerar endereços.");
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Colunas da fila ─────────────────────────────────────────────────────────

  const queueColumns: GridColDef[] = [
    {
      field: "sourceType",
      headerName: "Tipo",
      width: 110,
      renderCell: (params) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            params.value === "client"
              ? "bg-blue-100 text-blue-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {params.value === "client" ? "Cliente" : "Fornecedor"}
        </span>
      ),
    },
    { field: "code", headerName: "Código", width: 90 },
    { field: "name", headerName: "Destinatário", flex: 1, minWidth: 160 },
    {
      field: "address",
      headerName: "Endereço",
      width: 200,
      valueGetter: (_value, row) =>
        row.number ? `${row.street}, ${row.number}` : row.street,
    },
    {
      field: "cityState",
      headerName: "Cidade / UF",
      width: 150,
      valueGetter: (_value, row) =>
        row.state ? `${row.city} - ${row.state}` : row.city,
    },
    { field: "zipCode", headerName: "CEP", width: 100 },
    {
      field: "amount",
      headerName: "Quantidade",
      width: 130,
      renderCell: (params) => (
        <div className="flex items-center gap-2 h-full">
          <button
            onClick={() => decreaseAmount(params.row.id)}
            className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
            disabled={params.row.amount <= 1}
          >
            <CircleMinus size={18} />
          </button>
          <span className="text-sm font-semibold w-4 text-center">
            {params.row.amount}
          </span>
          <button
            onClick={() => increaseAmount(params.row.id)}
            className="text-gray-500 hover:text-gray-800"
          >
            <CirclePlus size={18} />
          </button>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => removeFromQueue(params.row.id)}
          className="text-red-400 hover:text-red-600 p-1"
          title="Remover da fila"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">
      {/* ── Busca ──────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Buscar destinatário
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Pesquise por nome ou código. Clique no resultado para adicionar à fila
          de impressão.
        </p>

        <div ref={searchRef} className="relative max-w-lg">
          <div className="flex items-center border border-gray-300 rounded-lg bg-white px-3 gap-2 focus-within:ring-1 focus-within:ring-color_primary_400 focus-within:border-color_primary_400">
            {loadingContacts ? (
              <span className="text-xs text-gray-400 py-3">
                Carregando cadastros...
              </span>
            ) : (
              <>
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Nome ou código do cliente / fornecedor..."
                  className="flex-1 py-2.5 text-sm bg-transparent outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Dropdown de resultados */}
          {showResults && searchResults.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((contact) => (
                <li
                  key={contact.id}
                  onMouseDown={() => addToQueue(contact)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {contact.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      #{contact.code}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {contact.city}
                      {contact.state ? ` - ${contact.state}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      contact.sourceType === "client"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {contact.sourceType === "client" ? "Cliente" : "Fornecedor"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {showResults && trimmed.length >= 1 && searchResults.length === 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
              <p className="text-sm text-gray-400">
                Nenhum resultado encontrado para "{searchQuery}".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Fila de impressão ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              Fila de impressão
            </h2>
            <p className="text-xs text-gray-400">
              {queue.length === 0
                ? "Nenhum endereço selecionado."
                : `${queue.reduce((acc, i) => acc + i.amount, 0)} etiqueta(s) a gerar.`}
            </p>
          </div>

          {queue.length > 0 && (
            <button
              onClick={() => setQueue([])}
              className="text-xs text-gray-400 hover:text-red-500 underline"
            >
              Limpar tudo
            </button>
          )}
        </div>

        <DataGrid
          rows={queue}
          columns={queueColumns}
          hideFooter={queue.length <= 10}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              color: "#1A2A38",
            },
            "& .MuiDataGrid-cell:focus-within": { outline: "none" },
            "& .MuiDataGrid-overlayWrapper": { minHeight: 80 },
          }}
        />

        <div className="mt-4 flex gap-3">
          <div className="w-52">
            <Button
              text="Gerar endereços"
              onClick={handleGenerate}
              isLoading={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
