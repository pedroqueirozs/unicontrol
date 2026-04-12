# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-04-12
**Sessão mais recente:** [[2026-04-12]]

---

## Estado dos Módulos

| Módulo | Estado | Observação |
|---|---|---|
| Dashboard | ✅ Pronto | KPIs + gráficos funcionando |
| Gestão de Mercadorias | ✅ Pronto | CRUD completo com Cypress E2E |
| Contas a Pagar | ✅ Pronto | NFs + boletos, validações RN-16 |
| Gestão de Endereços | ✅ Pronto | Gera .docx com remetente dinâmico |
| Documentos Úteis | ✅ Pronto | Upload/download Firebase Storage |
| Autenticação | ✅ Pronto | Login, registro, reset senha |
| Perfil do Usuário | ✅ Pronto | — |
| Gerenciar Usuários | ✅ Pronto | Convite, remoção, alteração de cargo com confirmação, lista e revogação de convites pendentes |
| Pendências de Clientes | ✅ Pronto | CRUD completo com histórico de atualizações em linha do tempo e filtro por status |
| Pendências com Fornecedores | ✅ Pronto | CRUD completo com histórico de atualizações em linha do tempo e filtro por status |
| Relatórios | 🔧 Placeholder | Sem definição de quais relatórios serão gerados |
| Configurações | 🔧 Placeholder | Sem definição de escopo |

---

## O que Foi Feito Recentemente (sessão 2026-04-12)

- Sistema de segundo cérebro com Obsidian configurado (`docs/para-ia.md`, `docs/sessoes/`)
- Gerenciar Usuários concluído: lista de convites pendentes, revogar convite, confirmação ao alterar cargo
- Pendências de Clientes implementado do zero: linha do tempo, filtro por status, modal de detalhe
- Pendências com Fornecedores implementado: mesma lógica, sem campo cidade

---

## Próximos Passos

- [ ] Definir escopo do módulo Relatórios (quais relatórios, filtros, dados)
- [ ] Definir escopo do módulo Configurações
- [ ] Documentar coleção `suppliers_pending` em `docs/arquitetura.md`

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
