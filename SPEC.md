# Especificação Técnica: Sistema de Controle de Atividades

## 1. Visão Geral do Sistema
O sistema é uma aplicação web local projetada para centralizar o registro, organização e acompanhamento de atividades internas de diferentes times. O objetivo é substituir controles manuais por uma ferramenta de gestão simples e eficiente, garantindo visibilidade sobre o status, prioridade e os responsáveis por cada demanda.

## 2. Requisitos Funcionais (RF)
- **RF01:** O sistema deve permitir o cadastro de uma nova atividade contendo: Título, Descrição, Prioridade, Categoria, Time responsável, Pessoa responsável e Status.
- **RF02:** O sistema deve listar todas as atividades cadastradas de forma clara.
- **RF03:** O sistema deve permitir a edição de todos os campos de uma atividade existente.
- **RF04:** O sistema deve permitir a exclusão de uma atividade.
- **RF05:** O sistema deve fornecer filtros combináveis para a listagem por: Prioridade, Categoria, Time e Pessoa responsável.
- **RF06:** O sistema deve permitir a atualização rápida do Status da atividade.
- **RF07:** O sistema deve registrar e exibir automaticamente a data de criação e a data da última atualização de cada atividade.

## 3. Requisitos Não Funcionais (RNF)
- **RNF01:** A aplicação deve ser construída utilizando React e Next.js (App Router recomendado).
- **RNF02:** Todo o código deve ser escrito em TypeScript.
- **RNF03:** O banco de dados deve ser SQLite, rodando localmente.
- **RNF04:** A comunicação com o banco de dados deve ser feita via Prisma ORM (ou Drizzle).
- **RNF05:** A interface deve ser estilizada utilizando Tailwind CSS (com integração do ShadCN UI para componentes, se desejado).
- **RNF06:** O sistema deve ser executável localmente através dos comandos `npm install`, `npx prisma migrate dev` e `npm run dev`.

## 4. Modelo de Dados
A entidade principal será `Activity` (Atividade).

**Tabela: `Activity`**
| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Primary Key | Identificador único da atividade. |
| `title` | String | Not Null | Título curto da demanda. |
| `description`| Text | Nullable | Descrição detalhada da atividade. |
| `priority` | Enum | Not Null | Valores: `BAIXA`, `MEDIA`, `ALTA`, `CRITICA`. |
| `category` | Enum | Not Null | Valores: `BUG`, `FEATURE`, `MELHORIA`, `SUPORTE`, `OPERACIONAL`. |
| `team` | String | Not Null | Nome do time responsável. |
| `assignee` | String | Not Null | Nome da pessoa responsável. |
| `status` | Enum | Not Null, Default:`PENDENTE`| Valores: `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`, `BLOQUEADA`. |
| `createdAt` | DateTime | Auto | Data/hora de criação. |
| `updatedAt` | DateTime | Auto-Update | Data/hora da última alteração. |

## 5. Fluxos da Interface
1. **Dashboard (Tela Inicial):** Exibe uma tabela ou grade de cards com as atividades. No topo (ou lateral), apresenta os campos de filtro (Selects para Prioridade, Categoria, etc.).
2. **Criação de Atividade:** Ao clicar no botão "Nova Atividade", um Modal (ou Sheet/Sidebar) é aberto com o formulário. Ao salvar, o modal fecha e a lista é atualizada.
3. **Edição:** Ao clicar em uma atividade na lista, o mesmo Modal de formulário é aberto, mas populado com os dados existentes para alteração.
4. **Mudança de Status:** A listagem deve permitir alterar o status diretamente via um dropdown (Select) na própria linha/card da atividade, sem precisar abrir a tela de edição completa.

## 6. Critérios de Aceite
- O formulário de criação/edição não pode ser submetido se os campos obrigatórios (`title`, `priority`, `category`, `team`, `assignee`, `status`) estiverem vazios.
- Os filtros devem atuar em conjunto (ex: filtrar por prioridade "ALTA" E status "PENDENTE" deve retornar apenas a interseção).
- A exclusão de uma atividade deve solicitar uma confirmação simples do usuário antes de processar no banco.

## 7. Casos de Erro
- **Erro de Validação Frontend:** Tentar submeter o formulário sem preencher o Título deve destacar o campo em vermelho com a mensagem "O título é obrigatório".
- **Erro de Banco de Dados:** Se houver falha na conexão ou na operação do Prisma, a interface deve exibir um "Toast" (notificação) genérico informando: "Ocorreu um erro ao processar sua solicitação. Tente novamente."

## 8. Estratégia de Validação
- **Tipagem Estrita:** Uso de TypeScript e validação de schema de formulário utilizando `Zod` para garantir que os dados enviados pelo cliente correspondam ao formato esperado pelo backend.
- **Server Actions:** As mutações (Create, Update, Delete) serão validadas no lado do servidor via Next.js Server Actions antes de interagir com o Prisma.
