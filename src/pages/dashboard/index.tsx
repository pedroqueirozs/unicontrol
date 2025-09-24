import {
  Folder,
  TriangleAlert,
  ShieldAlert,
  Users,
  PiggyBank,
  ChartLine,
  Package,
  MapPin,
  Clock,
  Target,
} from "lucide-react";
import InfoCard from "@/components/InfoCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
} from "recharts";
import { KPICard } from "@/components/KPICard";
import LoadingOverlay from "@/components/LoadingOverlay";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Dashboard() {
  const { generalStats, monthlyStats, transporterStats, loading } =
    useDashboardStats();

  if (loading) {
    return (
      <div>
        <LoadingOverlay open={true} />
      </div>
    );
  }

  //Dados do gráfico de linhas (mensal)
  const chartData = monthlyStats.map((m) => ({
    mes: m.month,
    enviadas: m.sent,
    entregues: m.delivered,
  }));

  // Dados do gráfico de pizza
  const pieData = transporterStats.map((t) => ({
    name: t.name,
    value: Number(t.percentage.toFixed(2)),
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Pedidos Entregues"
          value={generalStats ? String(generalStats.totalDelivered) : "—"}
          change="Entregues no último semestre"
          changeType="increase"
          icon={<Package size={32} />}
          color="blue"
        />
        <KPICard
          title="Mercadorias Atrasadas"
          value={generalStats ? String(generalStats.totalOverdue) : "—"}
          change="Atualmente em atraso"
          changeType="decrease"
          icon={<TriangleAlert size={32} />}
          color="red"
        />
        <KPICard
          title="Em Trânsito"
          value={generalStats ? String(generalStats.totalInTransit) : "—"}
          change="Dentro do prazo"
          changeType="neutral"
          icon={<Clock size={32} />}
          color="yellow"
        />
        <KPICard
          title="Taxa de Entrega"
          value={
            generalStats ? `${generalStats.deliveryRate.toFixed(2)}%` : "—"
          }
          change="em relação ao total enviado"
          changeType="increase"
          icon={<Target size={32} />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/*     Gráfico de Linhas  */}
        <div className="xl:col-span-2 rounded-2xl border border-neutral p-6 shadow-md bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Últimos (06 meses) Entregues vs Enviados
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="enviadas"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  name="Mercadorias Enviadas"
                />
                <Line
                  type="monotone"
                  dataKey="entregues"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Mercadorias Entregues"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="rounded-2xl border border-neutral p-6 shadow-md bg-white">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Distribuição por Transportadora
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}%`,
                    props.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({entry.payload?.value}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outras Funcionalidades */}
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
    </div>
  );
}
