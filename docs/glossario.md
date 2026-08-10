# Glossário — UniControl

Termos específicos usados na empresa e no sistema.

| Termo | Definição |
|---|---|
| **Pedido** | Documento gerado no sistema de vendas com os produtos, cliente e forma de pagamento |
| **NF / Nota Fiscal** | Nota fiscal emitida pela contabilidade para cada pedido enviado |
| **Boleto** | Forma de pagamento gerada manualmente no banco; pode haver mais de um por pedido |
| **Duplicata** | Boleto vencido que ainda não foi pago pelo cliente |
| **Conhecimento de Frete** | Documento gerado pela transportadora ao receber a mercadoria com o valor cobrado |
| **Cubagem** | Cálculo de volume da caixa feito pela transportadora para definir o peso cubado |
| **Situação do Pedido** | Estado atual da entrega: `No prazo`, `Atrasada`, `Entregue` |
| **Transportador** | Meio utilizado para envio: Correios, Transportadora, Ônibus ou Retirada |
| **Margem de Frete** | Valor adicionado ao frete cobrado do cliente para cobrir variações da transportadora |
| **Pendência** | Problema não resolvido com cliente, fornecedor ou transportador |
| **Drive** | Servidor/nuvem onde são armazenados arquivos escaneados de boletos e NFs |
| **Grupo (Financeiro)** | Separação lógica de empresa/centro de custo dentro do módulo Financeiro (ex: São José, Usinas, Contas Pessoais da Proprietária) — não é multi-tenant de verdade, é uma categorização dos lançamentos |
| **Lançamento** | Um registro de conta a pagar no módulo Financeiro — pode ser avulso (1 parcela) ou parcelado (N parcelas) |
| **Quitação** | Ato de marcar uma parcela do Financeiro como paga, com a data em que a proprietária informou o pagamento |
