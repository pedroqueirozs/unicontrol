export function formatCurrencyBRL(value: number | string): string {
  const number = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) return "R$ 0,00";

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
