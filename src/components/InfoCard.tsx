import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value?: string;
  variant?: "default" | "attention" | "success";
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
    attention: "bg-color_error text-blue-800 border-none",
    success: "bg-color_sucess text-yellow-800 border-none",
  };

  const content = (
    <div
      className={`rounded-xl border-border_input_color p-4 shadow-sm flex flex-col items-center justify-center gap-2 transition hover:shadow-xl min-h-24 ${
        variantStyles[variant]
      } ${to ? "cursor-pointer" : ""}`}
    >
      <div className="flex justify-center text-center gap-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-sm ">{title}</span>
      </div>
      <span className="text-5xl font-semibold">{value}</span>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
