import { TrendingUp, TrendingDown, Clock } from "lucide-react";

export const KPICard = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = "blue",
}: {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  color?: string;
}) => {
  const colorClasses = {
    blue: { card: "bg-blue-50 border-blue-200", icon: "text-blue-500" },
    green: { card: "bg-green-50 border-green-200", icon: "text-green-500" },
    yellow: { card: "bg-yellow-50 border-yellow-200", icon: "text-yellow-500" },
    red: { card: "bg-red-50 border-red-200", icon: "text-red-500" },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] ?? colorClasses.blue;

  const changeColor =
    changeType === "increase"
      ? "text-green-600"
      : changeType === "decrease"
      ? "text-red-600"
      : "text-gray-600";

  const TrendIcon =
    changeType === "increase"
      ? TrendingUp
      : changeType === "decrease"
      ? TrendingDown
      : Clock;

  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${colors.card}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${changeColor}`}>
            <TrendIcon size={16} className="mr-1" />
            <span>{change}</span>
          </div>
        </div>
        <div className={colors.icon}>{icon}</div>
      </div>
    </div>
  );
};
