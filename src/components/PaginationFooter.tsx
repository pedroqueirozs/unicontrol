import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
export function PaginationFooter() {
  return (
    <div className="flex justify-between text-sm  pt-4">
      <span>Mostrando 03 de 03 Registros</span>
      <div className="flex justify-center gap-2">
        <button>
          <ChevronLeft />
        </button>
        <button>1</button>
        <button>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
