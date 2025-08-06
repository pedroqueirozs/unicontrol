import { X } from "lucide-react";
import { PencilLine } from "lucide-react";
import { ChevronDown } from "lucide-react";

interface ShippingRecordProps {
  client: string;
  invoice: string;
  city: string;
  carrier: string;
  shippingDate: string;
  deliveryForecast: string;
  situation: "Entregue" | "No prazo" | "Atrasada";
  deliveryDate?: string;
  observation?: string;
}

export function ShippingRecord({
  client,
  invoice,
  city,
  carrier,
  shippingDate,
  deliveryForecast,
  situation,
  deliveryDate,
  observation,
}: ShippingRecordProps) {
  function hardOrShowObservation() {
    console.log("Notificação ocultada ou mostrada!");
  }
  return (
    <div className="border-b border-y-neutral text-sm">
      <div className="grid grid-cols-9 items-center gap-2 p-2 text-sm">
        <span>{client}</span>
        <span>{invoice}</span>
        <span>{city}</span>
        <span>{carrier}</span>
        <span>{shippingDate}</span>
        <span>{deliveryForecast}</span>
        <span
          className={`rounded text-tex_color_white flex justify-start w-fit p-1 ${
            situation === "Entregue"
              ? "bg-color_sucess "
              : situation === "No prazo"
              ? "bg-color_tertiary"
              : "bg-color_error"
          }`}
        >
          {situation}
        </span>
        <span>{deliveryDate}</span>

        <div className="flex gap-4">
          <button>
            <X className="text-color_error" />
          </button>
          <button>
            <PencilLine className="text-color_tertiary" />
          </button>
          <button>
            <ChevronDown onClick={hardOrShowObservation} />
          </button>
        </div>
      </div>

      {observation && <p className="px-2">Observação: {observation}</p>}
    </div>
  );
}
