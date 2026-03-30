# Regras de Negócio — UniControl

Documento consolidado com as regras identificadas a partir do fluxo da empresa.

---

## RN-01 — Cadastro de Produtos
- Novos produtos **devem ser cadastrados pelo contador**, não pelo setor de vendas
- Motivo: particularidades fiscais no cadastro exigem conhecimento contábil

## RN-02 — Endereços por Pedido
- A quantidade de endereços impressos para cada pedido é definida pela **Expedição**, não pelo Administrativo ou Vendas
- O Administrativo só imprime após receber essa informação

## RN-03 — Dimensões das Caixas
- Antes de cotar o frete, a Expedição deve fornecer: **Largura × Comprimento × Altura e Peso** de cada caixa
- Sem esses dados, o Administrativo não consegue cotar corretamente

## RN-04 — Escolha do Frete
- O frete é escolhido pelo **menor valor** entre as opções disponíveis:
  Correios, Transportadora, Ônibus ou Retirada na empresa

## RN-05 — Custo do Frete
- O frete é **custeado pela empresa**
- O cliente paga o valor do frete embutido no pedido (na nota fiscal)
- É adicionada uma **margem de segurança** no valor cobrado para cobrir variações da transportadora

## RN-06 — Variação do Frete
- A transportadora realiza pesagem e cubagem própria e pode cobrar valor diferente da cotação
- Quando o valor cobrado do cliente não cobre o custo real, compensação é feita no mês seguinte

## RN-07 — Pagamento via Pix
- Pedidos pagos via Pix exigem pagamento **antes do envio** do material
- O comprovante deve ser impresso e anexado ao pedido físico

## RN-08 — Pagamento via Boleto
- Boletos são gerados manualmente no site do banco
- Enviados manualmente por e-mail ou WhatsApp
- Nomenclatura do arquivo: `CIDADE NF-01 a 02.pdf`

## RN-09 — Pagamento dos Boletos a Pagar
- O **pagamento** dos boletos de fornecedores/prestadores é realizado pela **proprietária da empresa**
- O setor administrativo apenas controla o recebimento, conferência e arquivamento

## RN-10 — Controle de Fretes Mensal
- Ao final de cada mês, é feito o levantamento de:
  - Valor cobrado do cliente (por NF, por transportador)
  - Valor pago na transportadora
  - Resultado: positivo ou negativo

## RN-11 — Recebimento de Mercadorias
- Na conferência de recebimento: se tudo certo → assina com data e marca "OK"
- Se houver divergência → anota o que faltou para tratativa com o fornecedor

## RN-12 — Emissão de Nota Fiscal
- A NF é emitida pelo setor de **contabilidade** (não pelo administrativo ou vendas)
- Só é emitida após definição do transportador e valor do frete

## RN-13 — Controle de Estoque
- Atualmente **não existe** controle formal de estoque
- Qualquer solução deve ser **extremamente simples e intuitiva** (desafio cultural)

## RN-14 — Previsão de Entrega
- A previsão de entrega deve ser **igual ou posterior à data de envio**
- Não é possível prever entrega antes da mercadoria sair da empresa

## RN-15 — Data de Entrega
- A data de entrega deve ser **igual ou posterior à data de envio**
- Válido tanto para entregas via transportadora quanto para retiradas na empresa

---

## Problemas e Oportunidades de Melhoria

| # | Problema | Setor | Prioridade |
|---|---|---|---|
| P-01 | Endereços digitados manualmente no Word | Administrativo | Alta |
| P-02 | Sem controle de estoque | Expedição | Alta |
| P-03 | Produtos cadastrados por quem não deveria | Vendas | Média |
| P-04 | Cobrança de duplicatas manual via relatório do banco | Administrativo | Média |
| P-05 | Pedidos físicos arquivados em pastas de papel | Administrativo | Média |
| P-06 | Envio de boletos e NFs feito individualmente e manualmente | Administrativo | Alta |
| P-07 | Controle de pendências em planilhas separadas | Administrativo | Média |
| P-08 | Controle de frete mensal feito manualmente | Administrativo | Média |
