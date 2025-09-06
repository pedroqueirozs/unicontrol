import React from "react";
import { X, Trash2 } from "lucide-react";

// Interfaces para tipagem
interface Boleto {
  id?: string | number;
  numero: string;
  valor: number;
  vencimento: string;
}

interface NotaFiscalData {
  // Dados principais da nota
  beneficiario?: string;
  emitente?: string;
  numeroNota?: string;
  numero?: string;
  emissao?: string;
  dataEmissao?: string;
  valorTotal?: number;
  valor?: number;
  observacao?: string;
  qtdBoletos?: number;

  // Array de boletos relacionados
  boletos?: Boleto[];
}

interface ModalNotaFiscalProps {
  isOpen: boolean;
  onClose: () => void;
  notaData: NotaFiscalData | null;
  onEdit?: (nota: NotaFiscalData) => void;
  onDeleteBoleto?: (boleto: Boleto, index: number) => void;
}

const ModalNotaFiscal: React.FC<ModalNotaFiscalProps> = ({
  isOpen,
  onClose,
  notaData,
  onEdit = () => {},
  onDeleteBoleto = () => {},
}) => {
  if (!isOpen || !notaData) return null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = (): void => {
    if (onEdit && notaData) {
      onEdit(notaData);
    }
  };

  const handleDeleteBoleto = (boleto: Boleto, index: number): void => {
    if (onDeleteBoleto) {
      onDeleteBoleto(boleto, index);
    }
  };

  // Getters para campos com nomes alternativos
  const getEmitente = (): string =>
    notaData.beneficiario || notaData.emitente || "";
  const getNumeroNota = (): string =>
    notaData.numeroNota || notaData.numero || "";
  const getDataEmissao = (): string =>
    notaData.emissao || notaData.dataEmissao || "";
  const getValorTotal = (): number =>
    notaData.valorTotal || notaData.valor || 0;
  const getQtdBoletos = (): number =>
    notaData.qtdBoletos || notaData.boletos?.length || 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Dados da Nota Fiscal
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Dados da Nota Fiscal */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Dados da Nota Fiscal
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Emitente:</span>
                  <span className="font-medium text-gray-800">
                    {getEmitente()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nota Fiscal:</span>
                  <span className="font-medium text-gray-800">
                    {getNumeroNota()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data da emissão:</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(getDataEmissao())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor da Nota:</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(getValorTotal())}
                  </span>
                </div>
                {notaData.observacao && (
                  <div className="pt-3 border-t">
                    <span className="text-gray-600 block mb-2">
                      Observações:
                    </span>
                    <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg">
                      {notaData.observacao}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resumo
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Emitente:</span>
                    <span className="font-medium text-blue-800">
                      {getEmitente()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Número:</span>
                    <span className="font-medium text-blue-800">
                      {getNumeroNota()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Emissão:</span>
                    <span className="font-medium text-blue-800">
                      {formatDate(getDataEmissao())}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 border-blue-200">
                    <span className="text-blue-700 font-semibold">
                      Valor Total:
                    </span>
                    <span className="font-bold text-blue-800 text-lg">
                      {formatCurrency(getValorTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Qtd. Boletos:</span>
                    <span className="font-medium text-blue-800">
                      {getQtdBoletos()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Boletos */}
          {notaData.boletos && notaData.boletos.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Boletos</h3>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {notaData.boletos.length} boleto
                  {notaData.boletos.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Número
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Valor
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Vencimento
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {notaData.boletos.map((boleto: Boleto, index: number) => (
                      <tr
                        key={boleto.id || index}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {boleto.numero}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          {formatCurrency(boleto.valor)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(boleto.vencimento)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteBoleto(boleto, index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir boleto"
                            aria-label={`Excluir boleto ${boleto.numero}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Caso não tenha boletos */
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">📄</div>
              <p className="text-gray-600">
                Nenhum boleto encontrado para esta nota fiscal
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Editar Nota
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNotaFiscal;

// Exportar as interfaces para uso em outros componentes
export type { Boleto, NotaFiscalData, ModalNotaFiscalProps };
