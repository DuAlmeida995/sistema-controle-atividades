"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createActivity, updateActivity } from "@/app/actions/activityActions";
import type { CreateActivityInput } from "@/lib/validations/activity";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ActivityFormData = {
  id?: string;
  title?: string;
  description?: string | null;
  priority?: string;
  category?: string;
  team?: string;
  assignee?: string;
  status?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initial?: ActivityFormData | null;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const PRIORITIES = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Média" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

const CATEGORIES = [
  { value: "BUG", label: "Bug" },
  { value: "FEATURE", label: "Feature" },
  { value: "MELHORIA", label: "Melhoria" },
  { value: "SUPORTE", label: "Suporte" },
  { value: "OPERACIONAL", label: "Operacional" },
];

const STATUSES = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "BLOQUEADA", label: "Bloqueada" },
];

const EMPTY: ActivityFormData = {
  title: "",
  description: "",
  priority: "",
  category: "",
  team: "",
  assignee: "",
  status: "PENDENTE",
};

// ─── Shared input styles ───────────────────────────────────────────────────────

const inputClass =
  "w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm font-mono " +
  "px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 " +
  "focus:ring-amber-500 hover:border-zinc-500 transition-colors placeholder:text-zinc-700";

const errorInputClass =
  "w-full bg-zinc-900 border border-red-600 text-zinc-200 text-sm font-mono " +
  "px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 " +
  "focus:ring-red-500 placeholder:text-zinc-700";

// ─── Component ─────────────────────────────────────────────────────────────────

export function ActivityFormModal({ open, onClose, onSuccess, initial }: Props) {
  const [form, setForm] = useState<ActivityFormData>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [isPending, startTransition] = useTransition();
  const backdropRef = useRef<HTMLDivElement>(null);
  const isEditing = Boolean(initial?.id);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY);
      setFieldErrors({});
      setGlobalError("");
    }
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function set(key: keyof ActivityFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleSubmit() {
    setGlobalError("");
    startTransition(async () => {
      const payload = {
        ...form,
        description: form.description || null,
      };

      const result = isEditing
        ? await updateActivity(payload as Parameters<typeof updateActivity>[0])
        : await createActivity(payload as CreateActivityInput);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setGlobalError(result.error);
        }
        return;
      }

      onSuccess();
      onClose();
    });
  }

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Modal */}
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-700 shadow-2xl shadow-black flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase mb-0.5">
              {isEditing ? "Editando" : "Nova"}
            </div>
            <h2 className="text-sm font-mono font-semibold text-zinc-100 tracking-wide">
              {isEditing ? "Editar Atividade" : "Cadastrar Atividade"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Global error */}
          {globalError && (
            <div className="border border-red-800 bg-red-950/40 px-3 py-2 text-xs font-mono text-red-400">
              {globalError}
            </div>
          )}

          {/* Título */}
          <Field label="Título" error={fieldErrors.title?.[0]} required>
            <input
              type="text"
              placeholder="Ex: Corrigir erro no login"
              className={fieldErrors.title ? errorInputClass : inputClass}
              value={form.title ?? ""}
              onChange={(e) => set("title", e.target.value)}
              maxLength={150}
            />
          </Field>

          {/* Descrição */}
          <Field label="Descrição" error={fieldErrors.description?.[0]}>
            <textarea
              placeholder="Detalhes opcionais sobre a atividade..."
              className={`${inputClass} resize-none h-20`}
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              maxLength={2000}
            />
          </Field>

          {/* Prioridade + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prioridade" error={fieldErrors.priority?.[0]} required>
              <select
                className={fieldErrors.priority ? errorInputClass : inputClass}
                value={form.priority ?? ""}
                onChange={(e) => set("priority", e.target.value)}
              >
                <option value="">Selecionar...</option>
                {PRIORITIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Categoria" error={fieldErrors.category?.[0]} required>
              <select
                className={fieldErrors.category ? errorInputClass : inputClass}
                value={form.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Selecionar...</option>
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Time + Responsável */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time Responsável" error={fieldErrors.team?.[0]} required>
              <input
                type="text"
                placeholder="Ex: Backend"
                className={fieldErrors.team ? errorInputClass : inputClass}
                value={form.team ?? ""}
                onChange={(e) => set("team", e.target.value)}
                maxLength={100}
              />
            </Field>

            <Field label="Pessoa Responsável" error={fieldErrors.assignee?.[0]} required>
              <input
                type="text"
                placeholder="Ex: Ana Silva"
                className={fieldErrors.assignee ? errorInputClass : inputClass}
                value={form.assignee ?? ""}
                onChange={(e) => set("assignee", e.target.value)}
                maxLength={100}
              />
            </Field>
          </div>

          {/* Status */}
          <Field label="Status" error={fieldErrors.status?.[0]} required>
            <select
              className={fieldErrors.status ? errorInputClass : inputClass}
              value={form.status ?? "PENDENTE"}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 px-4 py-2 
                       border border-transparent hover:border-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="text-xs font-mono bg-amber-500 text-zinc-950 font-semibold px-5 py-2 
                       hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors tracking-wide"
          >
            {isPending ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Atividade"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-[10px] font-mono text-red-500">{error}</span>
      )}
    </div>
  );
}