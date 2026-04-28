# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-04-28
**Sessão mais recente:** [[2026-04-28]]

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
| Configurações | ✅ Pronto | Aba Empresa funcional (logo + dados); Operacional e Notificações são placeholder |

---

## O que Foi Feito Recentemente (sessão 2026-04-28)

- Módulo de Configurações implementado: aba Empresa com upload de logo e dados da empresa
- Logo da empresa embutida no .docx de endereços (logo à esquerda, dados à direita)
- CORS do Firebase Storage configurado via `gsutil` no Google Cloud Shell
- Correção de erro de build no Vercel (`insideH`/`insideV` inválidos no docx)
- Layout da página de Configurações reorganizado em cards com grid de 3 colunas

---

## Próximos Passos

- [ ] Definir escopo do módulo Relatórios (quais relatórios, filtros, dados)
- [x] Definir escopo do módulo Configurações
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
