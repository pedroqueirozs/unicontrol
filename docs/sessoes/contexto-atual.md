# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-04-30
**Sessão mais recente:** [[2026-04-30]]

---

## Estado dos Módulos

| Módulo | Estado | Observação |
|---|---|---|
| Dashboard | ✅ Pronto | KPIs + gráficos; atalhos corrigidos; cálculo de atraso usa início do dia |
| Gestão de Mercadorias | ✅ Pronto | Cliente obrigatório; flag de atenção; códigos de rastreio com cópia |
| Contas a Pagar | ✅ Pronto | NFs + boletos, validações RN-16 |
| Gestão de Endereços | ✅ Pronto | Busca por nome ou CNPJ/CPF; fila de impressão; gera .docx |
| Documentos Úteis | ✅ Pronto | Upload/download Firebase Storage |
| Autenticação | ✅ Pronto | Login, registro, reset senha |
| Perfil do Usuário | ✅ Pronto | E-mail com quebra correta no mobile |
| Gerenciar Usuários | ✅ Pronto | Convite, remoção, alteração de cargo com confirmação |
| Pendências (Clientes + Fornecedores) | ✅ Pronto | Página unificada `/pendencias`; campos `clientId`/`supplierId` corretos |
| Cadastros | ✅ Pronto | Código auto-gerado; CNPJ/CPF obrigatório com máscara; CEP com máscara |
| Relatórios | 🔧 Placeholder | Sem definição de quais relatórios serão gerados |
| Configurações | ✅ Pronto | Aba Empresa funcional (logo + dados); Operacional e Notificações são placeholder |

---

## O que Foi Feito Recentemente (sessão 2026-04-30)

- **Dashboard**: atalhos corrigidos (dois links de pendências → um `/pendencias`); cálculo de atraso corrigido para usar início do dia (não hora atual)
- **Cadastros**: código do cliente/fornecedor agora é auto-gerado (`C-001`/`F-001`); CNPJ/CPF obrigatório com máscara automática; CEP com máscara; busca por nome ou CNPJ
- **Busca nos módulos** (Endereços, Mercadorias, Pendências): filtro e dropdown trocados de código para CNPJ/CPF
- **Mercadorias Enviadas**: seleção de cliente obrigatória (RN-19); nome/cidade/UF desabilitados (vêm do cadastro); flag de atenção por linha; códigos de rastreio (múltiplos, array); copiar código no modal de detalhe; fix de restaurar cliente ao abrir edição
- **Pendências**: campos renomeados de `contactId`/`contactCode` para `clientId`/`clientCode` (customers) e `supplierId`/`supplierCode` (suppliers)

---

## Próximos Passos

- [ ] Definir escopo do módulo Relatórios (quais relatórios, filtros, dados)
- [ ] Fazer merge da branch `feat/cadastros` → `main` quando tudo estiver validado

---

## Decisões em Aberto

- O módulo de `vendas` não tem módulos ativos ainda — role existe mas sem telas próprias
- Controle de estoque foi identificado como necessidade mas é desafio cultural (RN-13)

---

## Onde Estão as Coisas

- Regras de negócio: [[../regras-de-negocio]]
- Arquitetura técnica: [[../arquitetura]]
- Fluxos dos setores: [[../fluxos/vendas]], [[../fluxos/expedicao]], [[../fluxos/administrativo-financeiro]]
- Entrada para IA: [[../para-ia]]
