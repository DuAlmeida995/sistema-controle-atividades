"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const PRIORITIES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
const CATEGORIES = ["BUG", "FEATURE", "MELHORIA", "SUPORTE", "OPERACIONAL"] as const;
const STATUSES = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "BLOQUEADA"] as const;

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

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  BLOQUEADA: "Bloqueada",
};

const selectClass =
  "bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono px-3 py-2 " +
  "focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 " +
  "hover:border-zinc-500 transition-colors cursor-pointer w-full";

export function ActivityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = {
    priority: searchParams.get("priority") ?? "",
    category: searchParams.get("category") ?? "",
    status: searchParams.get("status") ?? "",
    team: searchParams.get("team") ?? "",
    assignee: searchParams.get("assignee") ?? "",
  };

  const hasFilters = Object.values(current).some(Boolean);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
          Filtros
        </span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-mono text-amber-500 hover:text-amber-400 tracking-wider uppercase transition-colors"
          >
            ✕ Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {/* Prioridade */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
            Prioridade
          </label>
          <select
            className={selectClass}
            value={current.priority}
            onChange={(e) => updateFilter("priority", e.target.value)}
            disabled={isPending}
          >
            <option value="">Todas</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
            Categoria
          </label>
          <select
            className={selectClass}
            value={current.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            disabled={isPending}
          >
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
            Status
          </label>
          <select
            className={selectClass}
            value={current.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            disabled={isPending}
          >
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
            Time
          </label>
          <input
            type="text"
            placeholder="Ex: Backend"
            className={selectClass + " placeholder:text-zinc-700"}
            value={current.team}
            onChange={(e) => updateFilter("team", e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Responsável */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
            Responsável
          </label>
          <input
            type="text"
            placeholder="Ex: João"
            className={selectClass + " placeholder:text-zinc-700"}
            value={current.assignee}
            onChange={(e) => updateFilter("assignee", e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      {isPending && (
        <div className="mt-2 text-[10px] font-mono text-amber-500 animate-pulse">
          Filtrando...
        </div>
      )}
    </div>
  );
}