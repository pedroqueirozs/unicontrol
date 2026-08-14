# Contexto Atual do Projeto

> Arquivo atualizado ao final de cada sessão de trabalho.
> Qualquer IA deve ler este arquivo para saber exatamente onde o projeto está.

**Última atualização:** 2026-08-14
**Sessão mais recente:** commits finais do módulo Relatórios (Contas a Pagar) + fix do `proxy.ts`, importação em massa de ~370 fornecedores a partir de um PDF do sistema antigo (aplicada em dev **e em produção**, com detecção de duplicado por CNPJ), e abertura do PR de `feat/financeiro-contas-a-pagar` pra `main`. Detalhes completos: `docs/sessoes/2026-08-14.md`.

> **⚠️ Pendências pra próxima sessão:**
> 1. **Confirmar se o PR foi criado/mergeado** — o formulário foi preenchido no fim da sessão, mas não há confirmação de que o Pedro clicou em "Create pull request".
> 2. Não investigado: por que o merge do PR do Financeiro não disparou o deploy de Produção sozinho na Vercel (contornado manualmente com "Promote to Production" da vez anterior).
> 3. `scripts/import-suppliers.ts`, `scripts/check-existing-suppliers.ts` e `scripts/fornecedores-raw.txt` existem no filesystem local mas **não estão commitados** (decisão do Pedro — o repo é público e o `.txt` tem CPF/endereço pessoal de algumas pessoas físicas fornecedoras). Não commitar o `.txt` sem confirmar com ele de novo.

---

## Contexto da Migração

Este repositório é a **versão 2** do UniControl, reconstruída do zero com Next.js + PostgreSQL.

O projeto anterior (`unicontrol/`) foi desenvolvido com React + Vite + Firebase e está **completo e funcional**. A decisão de recriar do zero foi motivada por:
- Aprendizado de backend (Next.js API Routes + PostgreSQL)
- Eliminar dependência de cartão de crédito pessoal no Firebase
- Stack mais moderna e alinhada ao mercado

---

## Nome do Projeto

Renomeado em 2026-08-06: repositório GitHub e projeto Vercel eram "unicontrol-next", agora são **"unicontrol"** (`github.com/pedroqueirozs/unicontrol`). O repositório antigo da v1 (React + Vite + Firebase) foi renomeado antes pra liberar o nome — ver seção "Contexto da Migração" abaixo pra não confundir os dois.
O domínio de produção na Vercel **continua sendo `unicontrol-next.vercel.app`** — `unicontrol.vercel.app` já pertence a outra conta (namespace `.vercel.app` é global, não exclusivo do Pedro; a v1 teve o mesmo problema, por isso o domínio dela ficou `unicontrol-iota.vercel.app`). Resolver isso exigiria comprar um domínio próprio; ficou como pendência de baixa prioridade.

---

## Estado de Produção

O sistema está **em produção** desde julho de 2026:
- **Frontend/API:** Vercel (deploy automático a cada push no GitHub)
- **Banco de dados:** PostgreSQL na VPS própria (`82.25.75.171`)
- **Dados reais:** 2137 produtos importados via CSV, empresa e usuários cadastrados

---

## Ambiente de Desenvolvimento (2026-08-10)

Até 2026-08-10 só existia o banco de produção (VPS). Agora há um banco de dev local, isolado:

- **`docker-compose.yml`** (raiz do projeto) sobe um Postgres 16 local em `localhost:5432`, dados persistidos num volume Docker nomeado
- **`.env`** local aponta pro banco de dev; a `DATABASE_URL` de produção ficou comentada logo acima, só de referência — o `.env` **nunca** vai pra Vercel (está no `.gitignore`, produção usa variáveis configuradas direto no painel da Vercel), então alternar o valor local é sempre seguro
- Comandos do dia a dia:
  - `docker compose up -d` / `docker compose stop` — ligar/desligar sem perder dados
  - `docker compose down -v` — apaga tudo e recomeça do zero (útil pra testar migration limpa)
  - Depois de `down -v`: `npx prisma migrate deploy && npx prisma generate && npm run seed`
- `npm run seed` agora também cria o grupo padrão do Financeiro (nome da empresa) e as formas de pagamento comuns (Boleto, PIX, Cheque, Dinheiro, Transferência, Outro)
- Se o Docker não tiver instalado: `sudo apt install -y docker.io docker-compose-v2 && sudo systemctl enable --now docker && sudo usermod -aG docker $USER` (precisa logout/login ou `newgrp docker` depois)

---

## Estado dos Módulos

| Módulo | Estado |
|---|---|
| Setup inicial (Next.js + Prisma + NextAuth) | ✅ Concluído |
| Schema do banco (Prisma) | ✅ Concluído |
| Autenticação (login, convite, registro) | ✅ Concluído |
| Layout principal (Sidebar + Header) | ✅ Concluído |
| Dashboard | ✅ Concluído |
| Gestão de Mercadorias | ✅ Concluído |
| Gestão de Endereços | ✅ Concluído |
| Gerenciar Usuários | ✅ Concluído |
| Pendências (Clientes + Fornecedores) | ✅ Concluído |
| Cadastros (Clientes + Fornecedores) | ✅ Concluído |
| Estoque | ✅ Concluído |
| Configurações (dados da empresa + logo) | ✅ Concluído |
| Financeiro (Contas a Pagar) | ✅ Concluído, em produção |
| Documentos Úteis | 🚧 Placeholder "em construção" |
| Relatórios | 🚧 Primeiro relatório (Contas a Pagar) concluído, commitado; mais relatórios ainda por vir |

---

## Papéis (Roles)

Decisão de 2026-07-16: com a empresa ainda pequena, `expedicao` e `vendas` passaram a ter acesso a quase todos os módulos.

| Role | Acesso |
|---|---|
| `admin` | Tudo |
| `administrativo` | Mesmo acesso do admin |
| `expedicao` | Tudo, exceto Financeiro, Configurações e Gerenciar Usuários |
| `vendas` | Tudo, exceto Financeiro, Configurações e Gerenciar Usuários |

Helper centralizado em `src/lib/roles.ts` → `isAdminLevel(role)`.
**Proteção real é em `src/proxy.ts`** (bloqueia acesso direto por URL aos módulos restritos) — a sidebar (`components/sidebar.tsx`) só esconde o item de menu, não é a camada de segurança. Detalhes: `RN-18` em `docs/regras-de-negocio.md`.

---

## Detalhes Técnicos Importantes

### Logo da empresa
- Salva como **base64** no campo `logoUrl` da tabela `Company`
- Não usa filesystem — funciona na Vercel
- API: `src/app/api/company/logo/route.ts`

### Etiquetas de Estoque
- Geradas como **HTML em nova janela** com unidades em mm
- Tamanhos: Pequena (88mm), Média (130mm), Grande (175mm)
- Arquivo: `src/app/(app)/stock/label-print-modal.tsx`

### Estoque — Performance
- 2137 produtos em produção
- Paginação client-side de **50 itens por página** em `products-tab.tsx`
- Dados completos ficam em memória (necessário para Saída/Entrada)

### Build na Vercel
- `package.json` → `"build": "prisma generate && prisma migrate deploy && next build"` (o `migrate deploy` foi adicionado em 2026-08-12 — antes disso, migrations nunca eram aplicadas em produção automaticamente, só em dev; descoberto quando o módulo Financeiro foi pro ar e as tabelas novas não existiam no banco de produção. Ver `docs/sessoes/2026-08-12.md`.)
- O diretório `src/generated/prisma` está no `.gitignore` e é gerado no servidor a cada deploy

### Importação de Produtos
- Script: `scripts/import-products.ts`
- Arquivo CSV: `products-import.csv` (na raiz, ignorado pelo git)
- Comando: `npx tsx scripts/import-products.ts` ou `--limpar` para reimportar do zero
- SKUs preservam zeros à esquerda (ex: `00140`) para compatibilidade com sistema antigo

### Rastreio de encomendas (Mercadorias Enviadas)
- **Correios:** integração real com a API oficial (CWS / SRO-Rastro), não é só um link — `src/lib/correios.ts` autentica e consulta eventos de rastreio de verdade.
  - Credenciais em variáveis de ambiente: `CORREIOS_USUARIO`, `CORREIOS_CODIGO_ACESSO`, `CORREIOS_CONTRATO` (já cadastradas na Vercel, Production, marcadas como Sensitive).
  - Token é gerado e cacheado pelo próprio servidor (validade ~24h) — não precisa gerar token manualmente no dia a dia, só se as credenciais forem trocadas.
  - Rota interna: `GET /api/correios/track?codigo=...` (autenticada).
- **Página pública de rastreio:** `src/app/rastreio/[id]/page.tsx` — acessível **sem login** (liberada em `src/proxy.ts`, categoria `ALWAYS_PUBLIC_ROUTES`). URL usa o ID interno do envio, não o código dos Correios.
  - Correios: mostra a linha do tempo real (origem → destino de cada evento).
  - Outras transportadoras (ex: Braspress): mostra link externo pro site da transportadora, pré-preenchido com a NF.
- Botão "Rastrear" e "Copiar link de rastreio" (na tabela e no modal de detalhe) decidem o destino automaticamente pela transportadora — `getTrackButtonUrl()` em `goods-shipped/page.tsx`.

### Favicon
- O `favicon.ico` original era o placeholder padrão do `create-next-app` (nunca tinha sido trocado) — por isso aparecia o triângulo da Vercel em vez da logo em alguns navegadores/dispositivos.
- Corrigido: `favicon.ico` (multi-tamanho) e `apple-icon.png` gerados a partir da logo real, declarados explicitamente em `src/app/layout.tsx`.

### Ícone ao instalar como app / PWA (2026-07-23)
- **Problema relatado por Pedro:** ao instalar o UniControl como app no PC (Chrome/Edge "Instalar app") e no celular ("Adicionar à tela de início"), o ícone ficava feio, desproporcional e cortado.
- **Causa:** o projeto não tinha nenhum Web App Manifest (`manifest.json`/`manifest.webmanifest`). Sem manifest, o navegador improvisa um ícone ao instalar, e o `apple-icon.png` existente tinha a logo colada nas bordas do canvas (sem margem) — a máscara que o SO aplica ao instalar (círculo no Android, cantos arredondados no iOS/Windows) cortava a logo.
- **Correção:**
  - Criado `src/app/manifest.ts` (convenção do Next — servido automaticamente em `/manifest.webmanifest`), com nome, cor de tema (`#2B3D4F`, o mesmo azul da sidebar) e ícones em 192px/512px, incluindo a variante `maskable`.
  - Regenerados `src/app/apple-icon.png`, `public/icons/icon-192.png` e `public/icons/icon-512.png`: a marca (as 3 barrinhas) recriada com ~20% de margem em todos os lados sobre fundo sólido `#2B3D4F` — margem suficiente pra sobreviver a qualquer máscara de ícone do SO.
  - `src/app/layout.tsx` agora referencia o manifest e declara `viewport.themeColor` + `appleWebApp` para uma experiência melhor como app instalado.
- **Decisão de escopo:** o favicon/ícone do app é sempre a marca UniControl, igual pra todas as empresas — não muda por tenant nem depois do login (é definido uma única vez no layout raiz). Ficou de fora dessa mudança a personalização por empresa (logo/nome próprios pós-login), que foi avaliada mas descartada por Pedro por enquanto.

### Busca em Mercadorias Enviadas
- Filtro de texto livre em `goods-shipped/page.tsx`, combinado com as abas de situação (Todos/No Prazo/Atrasadas/Entregues).
- Busca por nome do cliente, NF, cidade, transportadora, código do cliente ou código de rastreio.

### Integridade do Estoque (2026-07-18)
- **Saída de estoque** (`movements/out/route.ts`) usa `updateMany` condicional (`WHERE currentStock >= quantidade`) dentro de transação — evita estoque negativo em saídas simultâneas do mesmo produto.
- **Entrada de estoque** (`movements/in/route.ts`) aceita o lote inteiro (`items: []`) numa única transação atômica, mesmo padrão da saída — antes era uma requisição por produto em loop, sem atomicidade entre itens.
- **Código do produto** tem constraint única no banco (`@@unique([companyId, code])`, migration `20260718033248_stock_product_code_unique`) — sem isso, dois cadastros simultâneos podiam gerar o mesmo código e o bipador de Entrada/Saída resolveria pro produto errado. `POST /api/stock/products` recalcula e tenta de novo automaticamente em caso de colisão.
- Detalhes completos da investigação e das correções: `docs/sessoes/2026-07-18.md`.

### Estorno e Ajuste de Estoque (2026-07-18)
- **Estorno** (`POST /api/stock/movements/[id]/reverse`): reverte um lançamento de entrada/saída errado, criando um movimento `type: "estorno"` vinculado (`reversalOfId`) e marcando o original como `reversedAt`. Qualquer operador estorna dentro de 24h; depois disso, só `admin`/`administrativo` (`isAdminLevel()`). Botão "Estornar" na aba Histórico.
- **Ajuste** (`POST /api/stock/movements/adjust`): corrige o `currentStock` para bater com a contagem física, registrando um movimento `type: "ajuste"` com `previousStock`/`newStock` e motivo obrigatório. Livre para todos os papéis (mesmo nível de Entrada/Saída). Ícone "Ajustar estoque" por produto na aba Estoque.
- Detalhes: `docs/sessoes/2026-07-18.md` (Parte 2) e `RN-21` em `docs/regras-de-negocio.md`.
- **Bloqueio de exclusão com estoque:** produto com `currentStock > 0` não pode ser excluído (`DELETE /api/stock/products/[id]` retorna 422) — o modal de exclusão detecta isso e oferece "Ajustar estoque" em vez de excluir. Produto zerado exclui normal. Detalhes: `docs/sessoes/2026-07-18.md` (Parte 3) e `RN-22`.
- **Histórico paginado + saldo rastreável:** `GET /api/stock/movements` pagina de verdade (`page`/`pageSize`/`type`, sem mais o limite fixo de 200). Toda movimentação (entrada/saída/estorno/ajuste) grava `previousStock`/`newStock` — o histórico mostra "Saldo (antes → depois)" pra qualquer tipo. `history-tab.tsx` busca seus próprios dados (não depende mais de `page.tsx`). As 62 movimentações antigas foram recalculadas via `scripts/backfill-movement-balances.ts` (idempotente, sempre roda em modo simulação por padrão — só grava com `--apply`). Detalhes: `docs/sessoes/2026-07-18.md` (Parte 4).
- **Texto em caixa alta:** nome/SKU/descrição/unidade do produto e o motivo de Entrada/Saída/Ajuste são normalizados em maiúsculas (cliente + servidor). Só vale pra dados novos — nada existente foi alterado retroativamente. Detalhes: `docs/sessoes/2026-07-18.md` (Parte 5).

### Carrinho de Entrada/Saída não perde seleção ao trocar de aba (2026-07-21)
- **Problema relatado pelo operador:** ao montar a lista de itens de uma Entrada/Saída, se ele precisasse ir até a aba "Estoque" para conferir algo (ex: nome exato de um produto) antes de continuar, todo o carrinho montado até ali era perdido.
- **Causa:** em `stock/page.tsx`, as abas eram renderizadas condicionalmente (`{activeTab === "entrada" && <MovementInTab />}`), então trocar de aba desmontava o componente e destruía seu estado local (carrinho, motivo, produto selecionado).
- **Correção:** `MovementInTab` e `MovementOutTab` (`stock/movement-in-tab.tsx`, `stock/movement-out-tab.tsx`) agora ficam sempre montadas; a troca de aba só alterna a classe `hidden` (CSS) em vez de desmontar o componente. `ProductsTab` e `HistoryTab` continuam sendo montadas sob demanda, sem necessidade de preservar estado.

### Busca da Saída e padronização do campo de quantidade (2026-07-21)
- **Busca com sugestões na Saída:** antes, o campo de bipagem da Saída só resolvia em match exato (código/SKU) ao apertar Enter, sem mostrar sugestões enquanto digitava. Agora filtra por nome/SKU/código a cada tecla e mostra um dropdown, igual à Entrada. O match exato por código/SKU continua tendo prioridade no Enter (evita ambiguidade quando o operador bipa).
- **Fluxo de seleção mudou na Saída:** antes, bipar/confirmar adicionava direto 1 unidade ao carrinho. Agora segue o mesmo padrão da Entrada: bipar ou digitar+Enter **seleciona** o produto (sem adicionar ainda) e o foco pula automaticamente para o campo de quantidade — o operador pode digitar um número (ex: bipar uma vez e digitar "5") ou usar os botões `+`/`-`, e confirma com Enter ou clicando "+ ADICIONAR". Os botões `+`/`-` que já existiam nas linhas do carrinho (para ajuste depois de adicionado) foram mantidos.
- **Componente novo `QuantityStepper`** (`stock/quantity-stepper.tsx`): campo de quantidade padrão (`[-] [input] [+]`) reutilizado por Entrada e Saída, substituindo o input solto que a Entrada tinha antes.
- **Atalho de teclado:** em ambas as abas, pressionar Enter no campo "Motivo" agora pula o foco direto pro campo de busca/bipagem — pensado para o fluxo com bipador de código de barras conectado.
- Motivação: pedido direto do operador do estoque, que perdia a seleção ao trocar de aba e sentia falta da busca por nome na Saída (só funcionava por código exato antes).

### Instalação como PWA no Android + proxy bloqueando arquivos técnicos (2026-08-06)
- Sequência de causas, cada uma escondendo a próxima: (1) faltava manifest — resolvido em 2026-07-23 (ver acima); (2) Chrome no Android só oferece "Instalar app" se o site tiver um Service Worker registrado com handler de `fetch` — não tínhamos nenhum, e pior: com manifest mas sem Service Worker, o Chrome nem cai mais no fallback antigo ("Adicionar à tela inicial" genérico), a opção simplesmente some; (3) mesmo depois de adicionar o Service Worker, ainda não funcionava — causa raiz era `src/proxy.ts`: o matcher liberava `.svg`/`.png`/`favicon.ico` da autenticação, mas não `manifest.webmanifest` nem `sw.js`, então usuário não-logado era redirecionado pro `/login` e o Chrome recebia HTML no lugar do manifest/service worker.
- **Service Worker** (`public/sw.js` + `src/components/service-worker-register.tsx`): handler de `fetch` **vazio** (sem `respondWith()`) — não faz cache de nada, existe só pra passar no critério técnico. Importante manter assim: este app mostra estoque/financeiro, que precisa estar sempre atualizado.
- **Proxy** (`src/proxy.ts`): matcher agora também exclui `manifest.webmanifest` e `sw.js` da autenticação — são arquivos técnicos sem dado sensível, o navegador precisa poder buscá-los mesmo deslogado.
- Confirmado funcionando no Android por Pedro após esse ajuste.

### Sessão de usuário — revisão de segurança + duração reduzida (2026-08-06)
- Revisão completa do NextAuth (`auth.ts`, `auth.config.ts`, fluxo de convite) a pedido do Pedro. Pontos fortes: bcrypt custo 12, cookie httpOnly, `AUTH_SECRET` com entropia adequada, erro de login genérico (sem enumeração de usuário), `companyId` sempre do token assinado no servidor, cadastro fechado por convite (7 dias de validade, uso único).
- **Gaps registrados, não corrigidos ainda:** sem rate limiting de tentativas de login; senha mínima de só 6 caracteres sem exigência de complexidade (`api/auth/register/route.ts`); token de convite usa `cuid()` em vez de um token aleatório criptográfico dedicado.
- **Mudança aplicada:** `session.maxAge` em `src/auth.config.ts` reduzido de 30 dias (padrão do NextAuth) pra **1 dia** — sistema é usado diariamente, então relogar uma vez por dia é o equilíbrio que o Pedro quis entre segurança e conveniência. É 24h corridas a partir do login, não "expira à meia-noite".

### Mercadorias Enviadas — ordenação por data de envio (2026-08-06)
- `GET /api/goods-shipped` ordenava por `createdAt` (ordem de cadastro), mas operadores registram envios fora de ordem (backlog, NF retroativa). Passou a ordenar por `shippingDate desc`, com `createdAt desc` como desempate para envios do mesmo dia.

### Módulo Financeiro — Contas a Pagar (2026-08-10)
- **Schema:** `PayableGroup`, `PaymentMethod`, `Payable` (cabeçalho) e `PayableInstallment` (parcelas) — decisões completas em `docs/arquitetura.md`. Migration `20260806044145_add_financial_payables_module`.
- **APIs:** `/api/financial/groups`, `/api/financial/payment-methods` (CRUD simples, `isActive` em vez de exclusão), `/api/financial/payables` + `/api/financial/payables/[id]` (cabeçalho + parcelas, edição reconcilia por diff pra não perder parcela já paga), `/api/financial/installments/[id]` (PATCH pra marcar pago/pendente), `/api/financial/dashboard?days=N` (agregados).
- **Telas** em `src/app/(app)/financial/`: `page.tsx` (abas), `dashboard-tab.tsx`, `lancamentos-tab.tsx` + `payable-form.tsx` (o formulário de lançamento, avulso ou parcelado), `simple-lookup-manager.tsx` (reutilizado pelas telas de Grupos e Formas de Pagamento).
- **Bug de React Hook Form encontrado e corrigido:** o campo "Valor" do modo Avulso e o da 1ª parcela do modo Parcelado compartilhavam o mesmo caminho de formulário (`installments.0.amount`) — o RHF manteve o `onChange` do Avulso "grudado" ao trocar de modo, corrompendo o total ao editar a parcela. Corrigido dando ao Avulso campos totalmente independentes (`avulsoAmount`/`avulsoDueDate`/`avulsoPaymentMethodId`), unidos ao restante só no submit. Também trocado `watch()` por `useWatch()` (o linter já alertava que `watch()` não é seguro com o React Compiler deste projeto). Detalhes da investigação: `docs/sessoes/2026-08-10.md`.
- **Regras completas:** `RN-16` em `docs/regras-de-negocio.md`.
- **Pendente:** proteção de rota já herda do bloqueio geral do `/financial` em `src/proxy.ts` (RN-18) — não foi criada nenhuma regra nova. Anexo de PDF do boleto ficou de fora por decisão do Pedro (ver RN-16).

### Módulo Relatórios — Contas a Pagar (2026-08-12/14)
- `/reports` virou um hub (cards por relatório, cada um liberado conforme o papel do usuário); primeiro relatório: `/reports/contas-a-pagar`.
- **API:** `GET /api/financial/reports/payables` — filtra por período (emissão/vencimento/pagamento), status, grupo, forma de pagamento, busca; sem paginação (retorna tudo que bate com o filtro, com teto de segurança de 5.000 linhas) — é relatório, não listagem, o ponto é totalizar tudo. Agrupamento visual e totais são calculados no cliente sobre o array já filtrado.
- **Proteção de rota:** admin-only, tanto na página (`redirect` se não for admin) quanto em `src/proxy.ts` (`ADMIN_ONLY_ROUTES`) — a segunda é a proteção real do projeto (RN-18), a primeira é só pra não renderizar uma tela morta.
- Detalhes completos (decisões de design, bug de condição de corrida encontrado e corrigido no filtro): `docs/sessoes/2026-08-14.md`.

### Importação de fornecedores do sistema antigo (2026-08-14)
- ~370 fornecedores importados a partir de um PDF exportado do sistema antigo (M3Soft), via script (`scripts/import-suppliers.ts`, não commitado — ver pendência no topo deste arquivo). Aplicado em dev e **em produção** (375 fornecedores no total hoje).
- CNPJ/CPF é obrigatório (RN-20) — 6 fornecedores do relatório antigo não tinham documento válido e ficaram de fora. 2 já existiam no banco (mesmo CNPJ, nome diferente) e foram pulados, não duplicados.
- Detalhes completos: `docs/sessoes/2026-08-14.md`.

---

## Próximos Passos Sugeridos

1. **Confirmar status do PR** de `feat/financeiro-contas-a-pagar` pra `main` (formulário preenchido no fim da sessão de 2026-08-14, não confirmado se foi criado/mergeado).
2. Investigar por que o deploy de Produção não disparou sozinho no merge do PR do Financeiro (ver `docs/sessoes/2026-08-12.md`).
3. Mais relatórios no módulo Relatórios, ou implementar módulo **Documentos Úteis** — a definir com o Pedro.
4. (Baixa prioridade, registrado mas não pedido ainda) Gaps de segurança da sessão de usuário — ver seção acima.
5. (Baixa prioridade, ideia registrada) Anexo de PDF do boleto no lançamento do Financeiro — descartado por ora, ver RN-16.
6. (Ideia registrada, não pedida) Lançar contas fixas recorrentes como um parcelado de 12x — funciona hoje com uma ressalva sobre documento obrigatório em boleto/cheque, ver `docs/sessoes/2026-08-12.md`.

---

## Onde Estão as Coisas

- Regras de negócio: `docs/regras-de-negocio.md`
- Arquitetura técnica: `docs/arquitetura.md`
- Fluxos dos setores: `docs/fluxos/`
- Referência de componentes: `docs/reference/components/`
- Referência de estilos: `docs/reference/styles/`
- Logs de sessões: `docs/sessoes/`
