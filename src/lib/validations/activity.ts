import { z } from "zod";

// ─── Enum Schemas ─────────────────────────────────────────────────────────────

export const PriorityEnum = z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"], {
  errorMap: () => ({ message: "Selecione uma prioridade válida." }),
});

export const CategoryEnum = z.enum(
  ["BUG", "FEATURE", "MELHORIA", "SUPORTE", "OPERACIONAL"],
  {
    errorMap: () => ({ message: "Selecione uma categoria válida." }),
  }
);

export const StatusEnum = z.enum(
  ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "BLOQUEADA"],
  {
    errorMap: () => ({ message: "Selecione um status válido." }),
  }
);

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type Priority = z.infer<typeof PriorityEnum>;
export type Category = z.infer<typeof CategoryEnum>;
export type Status = z.infer<typeof StatusEnum>;

// ─── Base Activity Schema ──────────────────────────────────────────────────────

const activityBaseSchema = z.object({
  title: z
    .string({ required_error: "O título é obrigatório." })
    .min(1, { message: "O título é obrigatório." })
    .max(150, { message: "O título deve ter no máximo 150 caracteres." }),

  description: z
    .string()
    .max(2000, { message: "A descrição deve ter no máximo 2000 caracteres." })
    .optional()
    .nullable(),

  priority: PriorityEnum,

  category: CategoryEnum,

  team: z
    .string({ required_error: "O time responsável é obrigatório." })
    .min(1, { message: "O time responsável é obrigatório." })
    .max(100, { message: "O nome do time deve ter no máximo 100 caracteres." }),

  assignee: z
    .string({ required_error: "A pessoa responsável é obrigatória." })
    .min(1, { message: "A pessoa responsável é obrigatória." })
    .max(100, {
      message: "O nome do responsável deve ter no máximo 100 caracteres.",
    }),

  status: StatusEnum,
});

// ─── Create Schema ─────────────────────────────────────────────────────────────
// Status defaults to PENDENTE on creation if not provided.

export const createActivitySchema = activityBaseSchema.extend({
  status: StatusEnum.default("PENDENTE"),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

// ─── Update Schema ─────────────────────────────────────────────────────────────
// All fields are optional — only the provided fields will be updated.
// The `id` is required to identify the record.

export const updateActivitySchema = activityBaseSchema.partial().extend({
  id: z
    .string({ required_error: "O ID da atividade é obrigatório." })
    .uuid({ message: "ID de atividade inválido." }),
});

export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

// ─── Quick Status Update Schema ────────────────────────────────────────────────
// Used for the inline status dropdown in the activity list (RF06).

export const updateStatusSchema = z.object({
  id: z
    .string({ required_error: "O ID da atividade é obrigatório." })
    .uuid({ message: "ID de atividade inválido." }),
  status: StatusEnum,
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// ─── Filter Schema ─────────────────────────────────────────────────────────────
// All filter fields are optional — they are combined with AND logic (RF05).

export const activityFilterSchema = z.object({
  priority: PriorityEnum.optional(),
  category: CategoryEnum.optional(),
  team: z.string().optional(),
  assignee: z.string().optional(),
  status: StatusEnum.optional(),
});

export type ActivityFilterInput = z.infer<typeof activityFilterSchema>;