export const formatDate = (date?: string | Date | number): string => {
  if (!date) return "";
  // Se for string no formato YYYY-MM-DD, adiciona hora local para evitar conversão UTC→local
  const normalized =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date + "T00:00:00"
      : date;
  return new Date(normalized).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
