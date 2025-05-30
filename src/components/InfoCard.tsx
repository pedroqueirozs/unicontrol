import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  variant?: "default" | "attention" | "sucess";
  to?: string;
}

export default function InfoCard({
  icon,
  title,
  value,
  variant = "default",
  to,
}: InfoCardProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-white text-gray-800 border border-gray-200",
    attention: "bg-color_error text-blue-800 border border-blue-300",
    sucess: "bg-color_sucess text-yellow-800 border border-yellow-300",
  };

  const content = (
    <div
      className={` rounded-2xl border-border_input_color  p-4 shadow-sm flex items-center justify-center gap-4 transition hover:shadow-md ${
        variantStyles[variant]
      } ${to ? "cursor-pointer" : ""}`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
