# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-04-19
**Sessão mais recente:** [[2026-04-19]]

---

## Estado dos Módulos

| Módulo | Estado | Observação |
|---|---|---|
| Dashboard | ✅ Pronto | KPIs + gráficos funcionando |
| Gestão de Mercadorias | ✅ Pronto | Observação exibida em modal ao clicar na linha |
| Contas a Pagar | ✅ Pronto | NFs + boletos, validações RN-16 |
| Gestão de Endereços | ✅ Pronto | Gera .docx com remetente dinâmico |
| Documentos Úteis | ✅ Pronto | Upload/download Firebase Storage |
| Autenticação | ✅ Pronto | Login, registro, reset senha |
| Perfil do Usuário | ✅ Pronto | E-mail com quebra correta no mobile |
| Gerenciar Usuários | ✅ Pronto | Convite, remoção, alteração de cargo com confirmação |
| Pendências de Clientes | ✅ Pronto | CRUD completo, filtros responsivos |
| Pendências com Fornecedores | ✅ Pronto | CRUD completo, filtros responsivos |
| Relatórios | 🔧 Placeholder | Sem definição de quais relatórios serão gerados |
| Configurações | 🔧 Placeholder | Sem definição de escopo |

---

## O que Foi Feito Recentemente (sessão 2026-04-19)

- Scroll duplo nas tabelas corrigido no `MainLayout`
- Página 404 criada com rota catch-all
- `vercel.json` criado para resolver 404 ao recarregar em produção
- Tabela de Mercadorias: coluna observação removida, modal de detalhe ao clicar na linha
- App responsivo para mobile: sidebar drawer, hamburguer, formulários adaptativos, filtros com wrap, avatar corrigido
- Logo ajustada em tamanho e qualidade de renderização SVG

---

## Próximos Passos

- [ ] Definir escopo do módulo Relatórios (quais relatórios, filtros, dados)
- [ ] Definir escopo do módulo Configurações
- [x] Documentar coleção `suppliers_pending` em `docs/arquitetura.md`

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
