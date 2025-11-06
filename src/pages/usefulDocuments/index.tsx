import { useState, useEffect, ChangeEvent } from "react";
import {
  Upload,
  Download,
  Printer,
  Trash2,
  File,
  FileText,
  Image,
  FileArchive,
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import { db, storage } from "@/services/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

type DocumentsProps = {
  id: string;
  name: string;
  sizeFormatted: string;
  storagePath: string;
  type: string;
  uploadDate: string;
  url: string;
};

export default function DocumentManagerFirebase() {
  const [documents, setDocuments] = useState<DocumentsProps[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentsProps[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadDocument = async (file: File) => {
    try {
      setUploading(true);

      const maxSize = 50 * 1024 * 1024;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "text/plain",
      ];

      if (file.size > maxSize)
        throw new Error("Arquivo muito grande. Máx: 50MB");
      if (!allowedTypes.includes(file.type))
        throw new Error("Tipo de arquivo não permitido");

      // Upload no Storage
      const storageRef = ref(
        storage,
        `documents/${crypto.randomUUID()}_${file.name}`
      );
      await uploadBytes(storageRef, file);

      // URL de download
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "documents"), {
        name: file.name,
        type: file.type,
        sizeFormatted: formatFileSize(file.size),
        uploadDate: serverTimestamp(),
        url: downloadURL,
        storagePath: storageRef.fullPath,
      });

      setSuccess("Documento enviado com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Erro ao fazer o upload");
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, storagePath: string) => {
    try {
      setError(null);

      // Remove do Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      // Remove do Firestore
      await deleteDoc(doc(db, "documents", documentId));

      setSuccess("Documento removido com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Erro ao remover documento");
      setTimeout(() => setError(null), 5000);
    }
  };

  const downloadDocument = async (doc: DocumentsProps) => {
    try {
      setError(null);
      window.open(doc.url, "_blank");
      setSuccess(`Download de ${doc.name} iniciado!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Erro no download");
      setTimeout(() => setError(null), 5000);
    }
  };

  const printDocument = async (doc: DocumentsProps) => {
    try {
      setError(null);
      window.open(doc.url, "_blank");
      setSuccess(`${doc.name} aberto para impressão!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Erro ao imprimir");
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    const q = query(collection(db, "documents"), orderBy("uploadDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate
          ? doc.data().uploadDate.toDate().toLocaleDateString("pt-BR")
          : "",
      })) as DocumentsProps[];
      setDocuments(docs);
    });
    return () => unsubscribe();
  }, []);

  // Filtrar
  useEffect(() => {
    if (searchTerm) {
      const filtered = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [documents, searchTerm]);

  const getFileIcon = (type: string) => {
    if (type?.includes("pdf")) return <File className="w-8 h-8 text-red-500" />;
    if (type?.includes("word") || type?.includes("document"))
      return <FileText className="w-8 h-8 text-notification_warn" />;
    if (type?.startsWith("image/"))
      return <Image className="w-8 h-8 text-green-500" />;
    return <FileArchive className="w-8 h-8 text-gray-500" />;
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) uploadDocument(file);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        {/* Notificações */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-color_error" />
              <span className="text-color_error">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-color_error hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-color_success" />
              <span className="text-green-700">{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-color_success hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar documentos..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg outline-none border border-solid border-border_input_color focus:border-color_secondary "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
              />
              <label
                htmlFor="file-upload"
                className="bg-color_info hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Documento
              </label>
            </div>
          </div>
        </div>

        {/* Status Upload */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-blue-700">
                Fazendo upload do arquivo...
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Upload
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc: DocumentsProps) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <div className="ml-4">
                          <div
                            className="text-sm font-medium text-gray-900"
                            title={doc.name}
                          >
                            {doc.name.length > 40
                              ? `${doc.name.substring(0, 40)}...`
                              : doc.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {doc.type?.split("/")[1]?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.sizeFormatted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                          title="Baixar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printDocument(doc)}
                          className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            deleteDocument(doc.id, doc.storagePath)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty */}
        {filteredDocuments.length === 0 && !uploading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileArchive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "Nenhum documento encontrado"
                : "Nenhum documento cadastrado"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Tente ajustar os termos de pesquisa"
                : "Comece fazendo upload do seu primeiro documento"}
            </p>
            {!searchTerm && (
              <label
                htmlFor="file-upload"
                className="bg-color_info hover:bg-green-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5" />
                Fazer Upload
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
