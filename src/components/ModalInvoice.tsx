import { useState } from "react";

import { Invoice, Slips } from "@/pages/financial";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useConfirmDialog } from "./ConfimDialog";
import Button from "./Button";

import { X } from "lucide-react";

import { formatDate } from "@/utils/formatDate";
import { formatCurrencyBRL } from "@/utils/ formatCurrency";
import { notify } from "@/utils/notify";

import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";

interface ModalInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: Invoice;
  slipsData: Slips[];
  getAllSlips: () => void;
}

export function ModalInvoice({
  isOpen,
  onClose,
  invoiceData,
  slipsData,
  getAllSlips,
}: ModalInvoiceProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  async function deleteInvoiceWithSlips(
    invoiceData: Invoice,
    slipsData: Slips[]
  ) {
    try {
      const confirmed = await confirm(
        "Tem certeza que deseja remover a nota e todos os boletos ?"
      );
      if (!confirmed) {
        return;
      }
      setLoading(true);

      await runTransaction(db, async (transaction) => {
        slipsData.forEach((slip) => {
          if (!slip.id) {
            throw new Error("Id do boleto não esta definido");
          }
          const slipRef = doc(db, "slips", slip.id);

          transaction.delete(slipRef);
        });

        if (!invoiceData.id) {
          throw new Error("Id da nota não esta definido");
        }
        const invoiceRef = doc(db, "invoices", invoiceData.id);
        transaction.delete(invoiceRef);
      });

      notify.success("Nota e boletos removidos com sucesso");
      getAllSlips();
    } catch (error) {
      console.log(error);
      notify.error("Erro ao remover nota e boletos");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteInvoiceWithSlips() {
    await deleteInvoiceWithSlips(invoiceData, slipsData).then(() => {
      onClose();
    });
  }

  if (!isOpen || !invoiceData) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Detalhes da compra
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteudo */}
        <div className="p-6 ">
          <div className="bg-bg_input_color rounded-lg p-4 ">
            <h2 className="text-color_primary_500 font-semibold pb-4">
              Dados da Nota Fiscal
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Emitente:</span>
                <span className="font-medium text-gray-800">
                  {invoiceData.issuer}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nota Fiscal: </span>
                <span className="font-medium text-gray-800">
                  {invoiceData.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data da emissão:</span>
                <span className="font-medium text-gray-800">
                  {formatDate(invoiceData.emission)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor da Nota:</span>
                <span className="font-medium text-gray-800">
                  {formatCurrencyBRL(invoiceData.invoiceValue)}
                </span>
              </div>
              {invoiceData.observations && (
                <div className="pt-3 border-t">
                  <span className="text-gray-600 block mb-2">Observação:</span>
                  <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg">
                    {invoiceData.observations}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-color_primary_500 font-semibold pb-4">Boletos</h2>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slipsData.map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {slip.ticketNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {formatCurrencyBRL(slip.ticketValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(slip.maturity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dialog}
            <LoadingOverlay open={loading} />
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                onClick={handleDeleteInvoiceWithSlips}
                text="Remover"
                backgroundColor="transparent"
                color="#E74C3C"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
