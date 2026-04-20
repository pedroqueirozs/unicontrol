# Arquitetura — UniControl

Documento que descreve a estrutura de dados do Firestore, decisões arquiteturais e fluxos técnicos do sistema.

---

## Modelo Multi-tenant (SaaS)

O UniControl é um SaaS onde cada empresa tem seus dados isolados.
Um usuário pertence a uma empresa e possui um role que define seu nível de acesso.

---

## Estrutura do Firestore

### `companies/{companyId}`
Representa uma empresa cadastrada no sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string | Nome da empresa |
| `street` | string | Endereço (rua e número) |
| `district` | string | Bairro |
| `city` | string | Cidade |
| `state` | string | Estado (ex: MG) |
| `zip` | string | CEP |
| `phone` | string | Telefone fixo |
| `whatsapp` | string | WhatsApp |
| `createdAt` | Timestamp | Data de criação |

> Criado manualmente pelo proprietário do SaaS (Pedro) para cada novo cliente.
> Os campos de endereço e contato são usados como remetente na geração de etiquetas (.docx).

---

### `users/{uid}`
Representa um usuário do sistema. O ID do documento é o mesmo UID do Firebase Auth.

| Campo | Tipo | Descrição |
|---|---|---|
| `companyId` | string | ID da empresa à qual o usuário pertence |
| `role` | string | Role do usuário: `admin`, `expedicao` ou `vendas` |
| `name` | string | Nome completo |
| `email` | string | E-mail do usuário |

> O primeiro `admin` de cada empresa é criado manualmente pelo proprietário do SaaS.
> Os demais usuários são criados via fluxo de convite.

---

### `invites/{token}`
Representa um convite gerado pelo admin para adicionar um novo membro à empresa.
O token é gerado via `crypto.randomUUID()`.

| Campo | Tipo | Descrição |
|---|---|---|
| `companyId` | string | ID da empresa para qual o convite foi gerado |
| `role` | string | Role que o novo usuário receberá |
| `expiresAt` | Timestamp | Data de expiração do convite |
| `used` | boolean | Se o convite já foi utilizado |
| `createdAt` | Timestamp | Data de criação do convite |

---

### `companies/{companyId}/{modulo}/{docId}`
Todos os dados de negócio ficam aninhados sob a empresa.

Exemplos:
```
companies/{companyId}/goods_shipped/{docId}
companies/{companyId}/financial/{docId}
companies/{companyId}/addresses/{docId}
companies/{companyId}/customers_pending/{docId}
companies/{companyId}/suppliers_pending/{docId}
```

---

### `companies/{companyId}/customers_pending/{docId}`
Representa uma pendência com um cliente.

| Campo | Tipo | Descrição |
|---|---|---|
| `clientName` | string | Nome do cliente |
| `city` | string | Cidade |
| `document` | string | NF ou outro documento de referência |
| `openedAt` | Timestamp | Data de abertura da pendência |
| `status` | string | `aberta`, `em_andamento` ou `resolvida` |
| `createdAt` | Timestamp | Data de criação do registro |
| `updates` | array | Lista de atualizações (ver abaixo) |

**Estrutura de cada item em `updates`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | UUID gerado no cliente (evita duplicatas no arrayUnion) |
| `text` | string | Texto da atualização |
| `createdAt` | Timestamp | Data e hora da atualização |

> **Status:** migração concluída. Todos os módulos já utilizam esta estrutura.

---

### `companies/{companyId}/suppliers_pending/{docId}`
Representa uma pendência com um fornecedor.

| Campo | Tipo | Descrição |
|---|---|---|
| `supplierName` | string | Nome do fornecedor |
| `document` | string | NF ou outro documento de referência |
| `openedAt` | Timestamp | Data de abertura da pendência |
| `status` | string | `aberta`, `em_andamento` ou `resolvida` |
| `createdAt` | Timestamp | Data de criação do registro |
| `updates` | array | Lista de atualizações (ver abaixo) |

**Estrutura de cada item em `updates`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | UUID gerado no cliente (evita duplicatas no arrayUnion) |
| `text` | string | Texto da atualização |
| `createdAt` | Timestamp | Data e hora da atualização |

> Estrutura idêntica à `customers_pending`, com a diferença de que o campo de referência é `supplierName` (fornecedor) em vez de `clientName` + `city` (cliente).
> A primeira `update` é criada automaticamente no momento da criação da pendência, a partir do campo "Descrição inicial" do formulário.

---

## Roles e Permissões

Definidos em `RN-16` (`docs/regras-de-negocio.md`).

| Role | Rota padrão após login |
|---|---|
| `admin` | `/dashboard` |
| `expedicao` | `/address` |
| `vendas` | `/profile` |

---

## Fluxo de Onboarding de um Novo Cliente

```
1. Pedro cria o documento companies/{companyId} no Firestore
2. Pedro cria o usuário admin no Firebase Auth (console)
3. Pedro cria o documento users/{uid} no Firestore com role: "admin"
4. Pedro envia as credenciais para o proprietário da empresa
5. Proprietário loga → acessa "Gerenciar Usuários"
6. Proprietário gera links de convite para seus funcionários
7. Funcionários se cadastram via /invite?token=xxx
```

---

## Fluxo de Convite de Novo Membro

```
Admin acessa "Gerenciar Usuários"
      ↓
Clica em "Convidar membro" → seleciona o role
      ↓
Sistema cria invites/{token} com validade de 7 dias
      ↓
Admin copia o link gerado e envia ao funcionário (WhatsApp, e-mail)
      ↓
Funcionário acessa /invite?token=xxx
      ↓
Sistema valida: token existe + não foi usado + não expirou
      ↓
Funcionário preenche nome, e-mail e senha
      ↓
Sistema cria conta no Firebase Auth
Sistema cria users/{uid} com companyId e role do convite
Sistema marca invites/{token} como used: true
      ↓
Funcionário é redirecionado para o login
```

---

## Decisões Arquiteturais

### Por que Firestore e não Firebase Auth Custom Claims para roles?
Custom Claims do Firebase Auth exigem Firebase Admin SDK (backend/Cloud Functions).
Usar Firestore para guardar roles evita essa dependência, mantendo o projeto 100% client-side.

### Por que o token do convite é gerado no cliente?
`crypto.randomUUID()` é nativo no browser e gera UUIDs criptograficamente seguros (versão 4).
Para o volume de usuários esperado, a probabilidade de colisão é desprezível.

### Por que o primeiro admin é criado manualmente?
Para os 3 clientes iniciais, o custo de criar manualmente é mínimo.
Implementar um painel de super-admin completo seria over-engineering nesse estágio.
