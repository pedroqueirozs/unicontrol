# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-04-09
**Sessão mais recente:** [[2026-04-09]]

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
| Gerenciar Usuários | 🔧 Em andamento | Fluxo de convite pronto; remover membro pronto (RN-17); revisar pendências |
| Pendências de Clientes | 🔧 Incompleto | Pasta existe, código parcial comentado; fluxo não definido |
| Pendências com Fornecedores | 🔧 Não iniciado | Pasta existe, sem implementação; fluxo não definido |
| Relatórios | 🔧 Placeholder | Sem definição de quais relatórios serão gerados |
| Configurações | 🔧 Placeholder | Sem definição de escopo |

---

## O que Foi Feito Recentemente

- Migração completa para multi-tenant (`companies/{companyId}`)
- Fluxo de convite de membros implementado
- Remoção de membros com auto-logout implementada (RN-17)
- Remetente dinâmico na geração de .docx
- Documentação de negócio criada (`docs/`)
- Sistema de "segundo cérebro" com Obsidian configurado (esta sessão)

---

## Próximos Passos

- [ ] Definir fluxo de Pendências de Clientes (quais campos, estados, quem usa)
- [ ] Definir fluxo de Pendências com Fornecedores
- [ ] Revisar módulo Gerenciar Usuários (verificar o que está incompleto)
- [ ] Definir escopo de Relatórios e Configurações

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
