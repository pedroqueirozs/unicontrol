import {
  Folder,
  TriangleAlert,
  PackageCheck,
  ShieldAlert,
  Users,
  PiggyBank,
  ChartLine,
  Package,
  MapPin,
} from "lucide-react";
import InfoCard from "@/components/InfoCard";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import dayjs from "dayjs";

import { MerchandiseUIData, MerchandiseFirestoreData } from "../goodsShipped";
import { GridColDef } from "@mui/x-data-grid";
import { CustomDataGrid } from "@/components/CustomDataGrid";

const columns: GridColDef[] = [
  { field: "name", headerName: "Cliente", width: 150 },
  { field: "document_number", headerName: "Nota Fiscal", width: 120 },
  { field: "city", headerName: "Cidade", width: 150 },
  { field: "uf", headerName: "UF", width: 150 },
  { field: "transporter", headerName: "Transportador", width: 150 },
  { field: "shipping_date", headerName: "Data de Envio", width: 130 },
  {
    field: "notes",
    headerName: "Observação",
    width: 130,
    editable: false,
  },
];

export default function Dashboard() {
  const [data, setData] = useState<MerchandiseUIData[]>([]);
  const [loading, setIsLoading] = useState(false);

  async function latestGoodsShipped() {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "goods_shipped"),
        orderBy("created_at", "desc"),
        limit(20)
      );

      const snapshot = await getDocs(q);

      const docs = snapshot.docs.map((doc) => {
        const data = doc.data() as MerchandiseFirestoreData;
        return {
          id: doc.id,
          ...data,
          shipping_date: dayjs(data.shipping_date.toDate()).format(
            "DD/MM/YYYY"
          ),
          delivery_forecast: dayjs(data.delivery_forecast.toDate()).format(
            "DD/MM/YYYY"
          ),
          delivery_date: data.delivery_date
            ? dayjs(data.delivery_date.toDate()).format("DD/MM/YYYY")
            : "",
          created_at: dayjs(data.created_at.toDate()).format("DD/MM/YYYY"),
          notes: data.notes ?? "",
        };
      });

      setData(docs);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    latestGoodsShipped();
  }, []);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <InfoCard
          icon={<TriangleAlert className="text-color_primary_300" />}
          title="MERCADORIAS ATRASADAS"
          value="09"
          variant="attention"
          to="/goods-shipped"
        />
        <InfoCard
          icon={<PackageCheck className="text-color_primary_300" />}
          title="ENTREGUES NO ULTIMO MÊS"
          value="32"
          variant="success"
          to="/goods-shipped"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          icon={<ShieldAlert />}
          title="Pendências com fornecedores"
          to="/suppliers-pending"
        />
        <InfoCard
          icon={<Users />}
          title="Trocas/ Avarias de clientes"
          to="/customers-pending"
        />
        <InfoCard icon={<PiggyBank />} title="Contas a pagar" to="/financial" />
        <InfoCard icon={<ChartLine />} title="Controle de Fretes" />
        <InfoCard
          icon={<Package />}
          title="Mercadorias enviadas"
          to="/goods-shipped"
        />
        <InfoCard
          icon={<Folder />}
          title="Central de documentos"
          to="/documents"
        />
        <InfoCard icon={<MapPin />} title="Endereços" to="/address" />
      </div>

      {/* Lista de últimas mercadorias enviadas */}
      <div className="rounded-2xl border border-neutral p-6 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Últimas mercadorias enviadas
        </h2>
        <CustomDataGrid columns={columns} rows={data} loading={loading} />
      </div>
    </div>
  );
}
