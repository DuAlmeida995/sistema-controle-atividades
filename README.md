# Sistema de Controle de Atividades

Uma aplicação web local para registro, organização e acompanhamento de atividades internas de times — construída com Next.js, TypeScript, SQLite e Prisma ORM, seguindo a abordagem **Specification-Driven Development (SDD)**.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript (strict) |
| Banco de dados | SQLite (local) |
| ORM | Prisma |
| Estilização | Tailwind CSS |
| Validação | Zod |
| Mutações | Next.js Server Actions |

---

## Pré-requisitos

- **Node.js** 18.17 ou superior
- **npm** 9+

---

## Execução local

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd controle-atividades
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

O conteúdo padrão do `.env.example` é:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Execute as migrations do banco de dados

```bash
npx prisma migrate dev
```

> Isso cria o banco SQLite em `prisma/dev.db` e aplica o schema da entidade `Activity`.

*(Opcional)* Para visualizar o banco via interface gráfica:

```bash
npx prisma studio
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura do projeto

```
.
├── prisma/
│   ├── schema.prisma          # Modelo de dados (Activity)
│   └── migrations/            # Histórico de migrations geradas
│
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── activityActions.ts   # Server Actions (CRUD + filtros)
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Página principal (Server Component)
│   │
│   ├── components/
│   │   ├── ActivityFilters.tsx      # Filtros combináveis via URL params
│   │   ├── ActivityFormModal.tsx    # Modal de criação e edição
│   │   ├── ActivityTable.tsx        # Tabela com status inline e exclusão
│   │   └── ActivityDashboard.tsx    # Orquestrador client (modal + toasts)
│   │
│   └── lib/
│       ├── prisma.ts                # Singleton do Prisma Client
│       └── validations/
│           └── activity.ts          # Schemas Zod (create, update, filter)
│
├── SPEC.md                    # Especificação técnica SDD/SDT
├── .env.example
└── README.md
```

---

## Funcionalidades

- **Cadastrar atividade** — modal com formulário validado (Zod + Server Action)
- **Listar atividades** — tabela responsiva com cards em mobile
- **Editar atividade** — mesmo modal, populado com dados existentes
- **Excluir atividade** — confirmação obrigatória antes da exclusão
- **Filtros combináveis** — por Prioridade, Categoria, Status, Time e Responsável (interseção AND, persistidos na URL)
- **Atualização rápida de status** — dropdown inline na própria linha da tabela, sem abrir modal
- **Datas automáticas** — `createdAt` e `updatedAt` gerenciados pelo Prisma
- **Toasts de feedback** — notificações de sucesso e erro empilháveis

---

## Decisões de arquitetura

### Separação Server / Client com "Ilha Client"

O `page.tsx` é um **Server Component** puro: busca os dados com `getActivities()` no servidor, calcula as métricas do header (total, críticas, em andamento, bloqueadas) e renderiza o HTML inicial sem JavaScript de estado.

Toda a interatividade fica encapsulada no `ActivityDashboard` — um **Client Component** que age como "ilha" dentro do server component. Isso evita marcar a página inteira como `"use client"` e preserva os benefícios de renderização no servidor.

```
page.tsx (Server)
└── ActivityFilters.tsx  (Client — URL params)
└── ActivityDashboard.tsx (Client — ilha de estado)
    ├── ActivityTable.tsx     (status inline, delete)
    └── ActivityFormModal.tsx (formulário create/edit)
```

### Filtros persistidos na URL via `searchParams`

Os filtros não usam `useState` local. Em vez disso, cada seleção atualiza os `searchParams` da URL via `useRouter().push()`. Isso garante:

- URLs compartilháveis com filtros ativos
- Navegação Back/Forward funcional no browser
- Filtros persistidos no reload da página
- Server Component re-renderiza com os dados já filtrados (sem roundtrip extra no client)

### Padrão `ActionResult<T>` nas Server Actions

Todas as Server Actions retornam um tipo discriminado:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

Isso elimina `try/catch` nos componentes e padroniza o tratamento de erros de validação (campo a campo via `fieldErrors`) versus erros de banco (mensagem genérica via `error`).

### Enums como `String` no SQLite

O SQLite não suporta tipos `enum` nativos. O schema usa `String` explicitamente para `priority`, `category` e `status`. A integridade dos valores é garantida pelos schemas Zod (`z.enum([...])`) validados nas Server Actions antes de qualquer operação no Prisma.

---

## Uso de IA — Specification-Driven Development com Claude

### Abordagem

Este projeto foi desenvolvido seguindo a metodologia **SDD (Specification-Driven Development)**: primeiro foi criado o documento `SPEC.md` com visão geral, requisitos funcionais e não funcionais, modelo de dados, fluxos de interface, critérios de aceite, casos de erro e estratégia de validação. Em seguida, o documento foi usado como **fonte única de verdade** para guiar a geração assistida por IA de cada camada da aplicação.

A ferramenta utilizada foi o **Claude (claude.ai)** diretamente no navegador, com prompts contextualizados e o `SPEC.md` sempre anexado como referência.

---

### Partes geradas ou assistidas por IA

#### `prisma/schema.prisma`
**Prompt:** geração do schema Prisma com provider `sqlite`, modelo `Activity` e todos os campos da especificação.

**Decisão assistida:** Claude identificou que o SQLite não suporta enums nativos do Prisma da mesma forma que o PostgreSQL e recomendou o uso de `String` com comentários de valores válidos, delegando a validação ao Zod — alinhado com a seção 8 da SPEC (Estratégia de Validação).

---

#### `src/lib/validations/activity.ts`
**Prompt:** geração dos schemas Zod para criação, edição, atualização rápida de status e filtros, com as mensagens de erro exatas exigidas pela SPEC (ex: `"O título é obrigatório."`).

**Estruturas geradas:**
- `createActivitySchema` — com `status` defaultando para `"PENDENTE"`
- `updateActivitySchema` — campos parciais + `id` UUID obrigatório
- `updateStatusSchema` — schema leve para o dropdown inline (RF06)
- `activityFilterSchema` — campos opcionais para filtros combináveis (RF05)
- Tipos TypeScript exportados via `z.infer<>`

---

#### `src/app/actions/activityActions.ts`
**Prompt:** geração das Server Actions de CRUD completo com Prisma Client, validação Zod server-side, `revalidatePath` e padrão de resposta tipado.

**Estruturas geradas:**
- `createActivity` — validação + insert + revalidação de cache
- `getActivities` — filtros opcionais combinados com `AND` lógico; `team` e `assignee` com `contains + mode: insensitive`
- `updateActivity` — verificação de existência antes do update
- `updateActivityStatus` — action separada para o dropdown inline, sem carregar payload completo
- `deleteActivity` — verificação de existência + delete com confirmação delegada à UI
- Tipo utilitário `ActionResult<T>` para respostas padronizadas

---

#### `src/components/ActivityFilters.tsx`
**Prompt:** componente de filtros combináveis usando `useSearchParams` e `useRouter`, com campos de select para Prioridade, Categoria e Status, e inputs de texto para Time e Responsável.

**Decisão assistida:** Claude sugeriu persistir os filtros na URL em vez de estado local, garantindo compartilhamento de links e compatibilidade com o Back/Forward do browser — decisão não explicitada na SPEC, mas alinhada com os critérios de qualidade de UX.

---

#### `src/components/ActivityFormModal.tsx`
**Prompt:** modal de criação e edição com formulário controlado, validação client-side de campos obrigatórios, highlight de erro em vermelho com mensagem (`"O título é obrigatório."`), e integração com as Server Actions.

**Estruturas geradas:**
- Lógica de modo duplo (create vs. edit) detectada via `initial?.id`
- Campo a campo mapeado dos enums da SPEC
- `fieldErrors` exibidos por campo, `globalError` para falhas de banco
- Fechamento por Escape, clique no backdrop ou botão Cancelar

---

#### `src/components/ActivityTable.tsx`
**Prompt:** tabela responsiva com dropdown inline de status (RF06), botão de exclusão com diálogo de confirmação (critério de aceite da SPEC), badges de prioridade com cores semânticas e cards para mobile.

**Estruturas geradas:**
- Layout dual: tabela desktop + cards mobile
- `confirmDeleteId` como estado local para o diálogo de confirmação
- Hover reveal nos botões de ação (✎ / ✕)
- Badges de prioridade e status com paleta de cores por severidade

---

#### `src/components/ActivityDashboard.tsx` + `src/app/page.tsx`
**Prompt:** página principal integrando todos os componentes, com métricas no header, tratamento de erro do banco e sistema de toasts.

**Decisão assistida:** Claude propôs a separação do `ActivityDashboard` como componente client intermediário — a "ilha client" — para preservar o `page.tsx` como Server Component puro, evitando que o estado do modal force a hidratação desnecessária de toda a página.

---

### Impacto no desenvolvimento

| Etapa | Tempo estimado sem IA | Com IA assistida |
|---|---|---|
| Schema Prisma + decisão de enums | ~30 min | ~5 min |
| Schemas Zod + tipos TypeScript | ~45 min | ~10 min |
| Server Actions (CRUD + filtros) | ~90 min | ~15 min |
| Componentes React (4 arquivos) | ~180 min | ~25 min |
| Arquitetura Server/Client | decisão manual | sugerida e justificada pela IA |
| **Total estimado** | **~6 horas** | **~55 min** |

A IA não apenas gerou código: ela aplicou as regras do `SPEC.md` diretamente nas implementações (mensagens de erro exatas, valores de enum, critérios de aceite) e tomou decisões de arquitetura justificadas que extrapolaram o documento — como filtros por URL e o padrão `ActionResult<T>` — elevando a qualidade da solução além do especificado.

---

## Especificação

O documento completo de especificação técnica SDD/SDT está em [`SPEC.md`](./SPEC.md).