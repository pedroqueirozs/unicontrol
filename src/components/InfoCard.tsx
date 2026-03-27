import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value?: string;
  variant?: "default" | "attention" | "success";
  to?: string;
  comingSoon?: boolean;
}

export default function InfoCard({
  icon,
  title,
  value,
  variant = "default",
  to,
  comingSoon = false,
}: InfoCardProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-white text-gray-800 border border-gray-200",
    attention:
      "bg-color_error text-color_primary_300 border-none font-semibold",
    success:
      "bg-color_success text-color_primary_300 border-none font-semibold",
  };

  const content = (
    <div
      className={`relative rounded-xl border-none p-4 shadow-sm flex flex-col items-center justify-center gap-2 transition min-h-24 ${
        variantStyles[variant]
      } ${to && !comingSoon ? "cursor-pointer hover:shadow-xl" : ""} ${
        comingSoon ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {comingSoon && (
        <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
          Em breve
        </span>
      )}
      <div className="flex justify-center items-center text-center gap-4">
        <span className={`text-3xl ${comingSoon ? "text-gray-400" : "text-blue-600"}`}>{icon}</span>
        <span className="text-sm">{title}</span>
      </div>
      {value && <span className="text-3xl font-semibold">{value}</span>}
    </div>
  );

  return to && !comingSoon ? <Link to={to}>{content}</Link> : content;
}
