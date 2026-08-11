// Compartilhado entre o formulário (cliente) e a API (servidor) — mesma regra
// dos dois lados: qual forma de pagamento exige número de documento.
// Comparação por nome (não por id fixo) porque formas de pagamento são
// cadastro livre do usuário, não um enum fechado.
export function paymentMethodRequiresDocumentNumber(paymentMethodName: string): boolean {
  const name = paymentMethodName.trim().toLowerCase()
  return name.includes("boleto") || name.includes("cheque")
}
