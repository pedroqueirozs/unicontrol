# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-04-29 (continuação)
**Sessão mais recente:** [[2026-04-29]]

---

## Estado dos Módulos

| Módulo | Estado | Observação |
|---|---|---|
| Dashboard | ✅ Pronto | KPIs + gráficos funcionando |
| Gestão de Mercadorias | ✅ Pronto | Observação exibida em modal ao clicar na linha |
| Contas a Pagar | ✅ Pronto | NFs + boletos, validações RN-16 |
| Gestão de Endereços | ✅ Pronto | Busca em clientes/fornecedores, fila de impressão, gera .docx |
| Documentos Úteis | ✅ Pronto | Upload/download Firebase Storage |
| Autenticação | ✅ Pronto | Login, registro, reset senha |
| Perfil do Usuário | ✅ Pronto | E-mail com quebra correta no mobile |
| Gerenciar Usuários | ✅ Pronto | Convite, remoção, alteração de cargo com confirmação |
| Pendências (Clientes + Fornecedores) | ✅ Pronto | Página unificada `/pendencias` com tabs, busca do cadastro, data padrão hoje |
| Cadastros | ✅ Pronto | CRUD de clientes e fornecedores com busca |
| Relatórios | 🔧 Placeholder | Sem definição de quais relatórios serão gerados |
| Configurações | ✅ Pronto | Aba Empresa funcional (logo + dados); Operacional e Notificações são placeholder |

---

## O que Foi Feito Recentemente (sessão 2026-04-29)

- Novo módulo **Cadastros** criado (`/cadastros`): CRUD de Clientes e Fornecedores com tabs, busca por nome/código, modal de criar/editar, confirmação de exclusão
- **Gestão de Endereços** reescrita: formulário manual removido, agora busca direto nos cadastros de clientes/fornecedores com dropdown de resultados em tempo real
- **DocxGenerator** atualizado: novo tipo `PrintQueueItem` (campos separados: rua, número, complemento, bairro, cidade, estado, CEP); complemento só aparece no .docx se preenchido; cidade exibe estado junto ("São Paulo - SP")
- Coleção `addresses` do Firestore depreciada (não recebe novos dados)
- **Mercadorias Enviadas**: campo de busca de cliente no topo do formulário; auto-preenche nome, cidade e UF; armazena `clientId` e `clientCode` no Firestore
- **Pendências** unificadas em `/pendencias`: duas rotas separadas viraram uma página com tabs Clientes e Fornecedores; busca do cadastro no modal de criação; data de abertura padrão = hoje; páginas antigas removidas
- Branch de trabalho: `feat/cadastros`

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
