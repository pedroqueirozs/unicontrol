# CLAUDE.md — UniControl

Esse arquivo contém instruções permanentes para o Claude Code neste projeto.

## Sobre o Projeto

**UniControl** é uma aplicação web para automatizar processos internos de uma empresa.
Stack: React 18 + TypeScript + Vite + Tailwind CSS + MUI + Firebase (Auth, Firestore, Storage).

## Sobre o Desenvolvedor

Pedro é desenvolvedor júnior. Prefere explicações didáticas junto com o código.
Sempre explique o **porquê** das decisões importantes, não só o **o quê**.

## Regras de Trabalho

### Antes de qualquer modificação
- Ler o arquivo antes de editá-lo (nunca editar às cegas)
- Entender o que já existe antes de propor mudanças
- Confirmar com Pedro antes de ações destrutivas ou irreversíveis

### Commits
- **Nunca fazer commit sem Pedro pedir explicitamente**
- Mensagens de commit em **ingles**, no formato: `type: short description`
- Tipos: `feat` (nova funcionalidade), `fix` (correção), `refactor` (refatoração), `style` (estilo), `docs` (documentação)
- Exemplos:
  - `feat: adds customer pending`
  - `fix: fixes total calculation in dashboard`

### Código
- Não adicionar funcionalidades além do que foi pedido
- Não refatorar código que não está sendo modificado
- Manter o padrão já existente no projeto (TypeScript strict, Tailwind, React Hook Form + Yup)
- Componentes novos vão em `src/components/`
- Páginas novas vão em `src/pages/`
- Sempre usar o alias `@/` ao invés de caminhos relativos longos

### Alertas obrigatórios
Sempre avisar Pedro antes de:
- Deletar arquivos
- Fazer push para o repositório remoto
- Modificar configurações de build ou Firebase
- Qualquer ação que não possa ser desfeita facilmente


