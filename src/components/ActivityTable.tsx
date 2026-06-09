"use client";

import { useState, useTransition } from "react";
import { updateActivityStatus, deleteActivity } from "@/app/actions/activityActions";
import type { ActivityFormData } from "./ActivityFormModal";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Activity = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  category: string;
  team: string;
  assignee: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  activities: Activity[];
  onEdit: (activity: ActivityFormData) => void;
  onToast: (msg: string, type?: "error" | "success") => void;
};

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  BAIXA: "bg-zinc-800 text-zinc-400 border-zinc-700",
  MEDIA: "bg-blue-950 text-blue-400 border-blue-800",
  ALTA: "bg-orange-950 text-orange-400 border-orange-800",
  CRITICA: "bg-red-950 text-red-400 border-red-800",
};

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: "bg-zinc-800 text-zinc-400",
  EM_ANDAMENTO: "bg-amber-950 text-amber-400",
  CONCLUIDA: "bg-green-950 text-green-400",
  BLOQUEADA: "bg-red-950 text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  BLOQUEADA: "Bloqueada",
};

const PRIORITY_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const CATEGORY_LABELS: Record<string, string> = {
  BUG: "Bug",
  FEATURE: "Feature",
  MELHORIA: "Melhoria",
  SUPORTE: "Suporte",
  OPERACIONAL: "Operacional",
};

const STATUSES = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "BLOQUEADA"] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export function ActivityTable({ activities, onEdit, onToast }: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const result = await updateActivityStatus({
        id,
        status: status as (typeof STATUSES)[number],
      });
      if (!result.success) {
        onToast(result.error, "error");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteActivity(id);
      if (!result.success) {
        onToast(result.error, "error");
      } else {
        onToast("Atividade excluída.", "success");
      }
      setConfirmDeleteId(null);
    });
  }

  if (activities.length === 0) {
    return (
      <div className="border border-zinc-800 bg-zinc-950 px-6 py-16 text-center">
        <div className="text-zinc-700 font-mono text-sm mb-1">
          Nenhuma atividade encontrada
        </div>
        <div className="text-zinc-800 font-mono text-xs">
          Ajuste os filtros ou crie uma nova atividade
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              {["Título", "Prioridade", "Categoria", "Time", "Responsável", "Status", "Atualizado", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[9px] tracking-[0.2em] text-zinc-600 uppercase font-normal"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, idx) => (
              <tr
                key={activity.id}
                className={`border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors group
                  ${idx % 2 === 0 ? "bg-zinc-950" : "bg-zinc-950/60"}`}
              >
                {/* Title */}
                <td className="px-4 py-3 max-w-[220px]">
                  <button
                    onClick={() => onEdit(activity)}
                    className="text-left text-zinc-200 hover:text-amber-400 transition-colors line-clamp-1 font-medium"
                    title={activity.title}
                  >
                    {activity.title}
                  </button>
                  {activity.description && (
                    <div className="text-zinc-700 text-[10px] line-clamp-1 mt-0.5">
                      {activity.description}
                    </div>
                  )}
                </td>

                {/* Priority */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block border px-2 py-0.5 text-[9px] tracking-wider uppercase ${
                      PRIORITY_STYLES[activity.priority] ?? "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {PRIORITY_LABELS[activity.priority] ?? activity.priority}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-zinc-400">
                  {CATEGORY_LABELS[activity.category] ?? activity.category}
                </td>

                {/* Team */}
                <td className="px-4 py-3 text-zinc-400 max-w-[100px] truncate">
                  {activity.team}
                </td>

                {/* Assignee */}
                <td className="px-4 py-3 text-zinc-300 max-w-[120px] truncate">
                  {activity.assignee}
                </td>

                {/* Status — inline dropdown */}
                <td className="px-4 py-3">
                  <select
                    className={`text-[10px] font-mono px-2 py-1 border-0 focus:outline-none 
                      focus:ring-1 focus:ring-amber-500 cursor-pointer transition-colors
                      ${STATUS_STYLES[activity.status] ?? "bg-zinc-800 text-zinc-400"}`}
                    value={activity.status}
                    onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                    disabled={isPending}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900 text-zinc-200">
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Updated at */}
                <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                  {new Date(activity.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(activity)}
                      className="text-zinc-600 hover:text-amber-400 transition-colors"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(activity.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-zinc-800 bg-zinc-950 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onEdit(activity)}
                className="text-sm font-mono font-medium text-zinc-200 hover:text-amber-400 
                           transition-colors text-left"
              >
                {activity.title}
              </button>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onEdit(activity)}
                  className="text-zinc-600 hover:text-amber-400 transition-colors text-sm"
                >
                  ✎
                </button>
                <button
                  onClick={() => setConfirmDeleteId(activity.id)}
                  className="text-zinc-600 hover:text-red-500 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`border px-2 py-0.5 text-[9px] tracking-wider uppercase font-mono ${
                  PRIORITY_STYLES[activity.priority] ?? ""
                }`}
              >
                {PRIORITY_LABELS[activity.priority]}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {CATEGORY_LABELS[activity.category]}
              </span>
            </div>

            <div className="text-[10px] font-mono text-zinc-600">
              {activity.team} · {activity.assignee}
            </div>

            <select
              className={`w-full text-[10px] font-mono px-2 py-1.5 border-0 
                focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer
                ${STATUS_STYLES[activity.status] ?? ""}`}
              value={activity.status}
              onChange={(e) => handleStatusChange(activity.id, e.target.value)}
              disabled={isPending}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-zinc-900 text-zinc-200">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-700 p-6 shadow-2xl">
            <div className="text-[9px] font-mono tracking-[0.2em] text-red-600 uppercase mb-3">
              Confirmar Exclusão
            </div>
            <p className="text-sm font-mono text-zinc-300 mb-6">
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="text-xs font-mono text-zinc-500 hover:text-zinc-300 
                           px-4 py-2 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={isPending}
                className="text-xs font-mono bg-red-900 text-red-200 font-semibold px-5 py-2 
                           hover:bg-red-800 disabled:opacity-50 transition-colors border border-red-800"
              >
                {isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}