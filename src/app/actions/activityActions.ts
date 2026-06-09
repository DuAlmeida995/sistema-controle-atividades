"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import {
  createActivitySchema,
  updateActivitySchema,
  updateStatusSchema,
  activityFilterSchema,
  type CreateActivityInput,
  type UpdateActivityInput,
  type UpdateStatusInput,
  type ActivityFilterInput,
} from "../../lib/validations/activity";

// ─── Response Type ─────────────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── createActivity ────────────────────────────────────────────────────────────

export async function createActivity(
  input: CreateActivityInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = createActivitySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos. Verifique os campos e tente novamente.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const activity = await prisma.activity.create({
      data: parsed.data,
    });

    revalidatePath("/");
    return { success: true, data: { id: activity.id } };
  } catch (err) {
    console.error("[createActivity]", err);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}

// ─── getActivities ─────────────────────────────────────────────────────────────
// Accepts combinable filters (RF05). All filters are applied with AND logic.

export async function getActivities(
  filters: ActivityFilterInput = {}
): Promise<ActionResult<Awaited<ReturnType<typeof fetchActivities>>>> {
  const parsed = activityFilterSchema.safeParse(filters);

  if (!parsed.success) {
    return {
      success: false,
      error: "Filtros inválidos.",
    };
  }

  try {
    const data = await fetchActivities(parsed.data);
    return { success: true, data };
  } catch (err) {
    console.error("[getActivities]", err);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}

async function fetchActivities(filters: ActivityFilterInput) {
  const where: Record<string, unknown> = {};

  if (filters.priority) where.priority = filters.priority;
  if (filters.category) where.category = filters.category;
  if (filters.status) where.status = filters.status;

  // team and assignee use case-insensitive contains for better UX
  if (filters.team) {
    where.team = { contains: filters.team, mode: "insensitive" };
  }
  if (filters.assignee) {
    where.assignee = { contains: filters.assignee, mode: "insensitive" };
  }

  return prisma.activity.findMany({
    where,
    orderBy: [
      // Show most critical/urgent items first, then newest
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });
}

// ─── updateActivity ────────────────────────────────────────────────────────────

export async function updateActivity(
  input: UpdateActivityInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateActivitySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos. Verifique os campos e tente novamente.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { id, ...data } = parsed.data;

  try {
    // Ensure the record exists before updating
    const exists = await prisma.activity.findUnique({ where: { id } });
    if (!exists) {
      return { success: false, error: "Atividade não encontrada." };
    }

    const updated = await prisma.activity.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    return { success: true, data: { id: updated.id } };
  } catch (err) {
    console.error("[updateActivity]", err);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}

// ─── updateActivityStatus ──────────────────────────────────────────────────────
// Lightweight action for the inline status dropdown (RF06).

export async function updateActivityStatus(
  input: UpdateStatusInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Status inválido.",
    };
  }

  const { id, status } = parsed.data;

  try {
    const exists = await prisma.activity.findUnique({ where: { id } });
    if (!exists) {
      return { success: false, error: "Atividade não encontrada." };
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/");
    return { success: true, data: { id: updated.id } };
  } catch (err) {
    console.error("[updateActivityStatus]", err);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}

// ─── deleteActivity ────────────────────────────────────────────────────────────

export async function deleteActivity(
  id: string
): Promise<ActionResult> {
  if (!id || typeof id !== "string") {
    return { success: false, error: "ID inválido." };
  }

  try {
    const exists = await prisma.activity.findUnique({ where: { id } });
    if (!exists) {
      return { success: false, error: "Atividade não encontrada." };
    }

    await prisma.activity.delete({ where: { id } });

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[deleteActivity]", err);
    return {
      success: false,
      error: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
    };
  }
}