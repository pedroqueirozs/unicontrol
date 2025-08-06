import {
  Folder,
  TriangleAlert,
  PackageCheck,
  ShieldAlert,
  Users,
  PiggyBank,
  ChartLine,
  Package,
} from "lucide-react";
import InfoCard from "../../components/InfoCard";

export default function Dashboard() {
  const ultimasMercadorias = [
    {
      id: 1,
      nome: "Paróquia N Sra Aparecida #1234 - São Paulo",
      data: "22/05/2025",
    },
    {
      id: 2,
      nome: "Paróquia São Pedro e São Paulo #1235 - Rio de Janeiro",
      data: "21/05/2025",
    },
    {
      id: 3,
      nome: "Pe.Márcio Junior #1236 - Minas Gerais",
      data: "20/05/2025",
    },
    {
      id: 4,
      nome: "Área Pastoral da paróquia de Acara #1237 - Paraná",
      data: "19/05/2025",
    },
    {
      id: 5,
      nome: "Paróquia Nossa Senhora Aparecida #1237 - Paraná",
      data: "19/05/2025",
    },
    {
      id: 6,
      nome: "Paróquia Nossa Senhora Aparecida #1237 - Paraná",
      data: "19/05/2025",
    },
    {
      id: 7,
      nome: "Paróquia Nossa Senhora Aparecida #1237 - Paraná",
      data: "19/05/2025",
    },
    {
      id: 8,
      nome: "Paróquia Nossa Senhora Aparecida #1237 - Paraná",
      data: "19/05/2025",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <InfoCard
          icon={<TriangleAlert className="text-red-500" />}
          title="MERCADORIAS ATRASADAS"
          value="09"
          variant="attention"
          to="/goods-shipped"
        />
        <InfoCard
          icon={<PackageCheck className="text-green-600" />}
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
      </div>

      {/* Lista de últimas mercadorias enviadas */}
      <div className="rounded-2xl border border-neutral p-6 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Últimas mercadorias enviadas
        </h2>
        <ul className="divide-y divide-neutral">
          {ultimasMercadorias.map((item) => (
            <li
              key={item.id}
              className="py-2 text-sm text-gray-700 flex justify-between"
            >
              <span className="font-medium">{item.nome}</span>
              <span className="text-gray-500">{item.data}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
