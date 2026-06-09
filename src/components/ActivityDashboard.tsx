"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ActivityTable, type Activity } from "./ActivityTable";
import { ActivityFormModal, type ActivityFormData } from "./ActivityFormModal";

type Props = {
  activities: Activity[];
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

export function ActivityDashboard({ activities }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ActivityFormData | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(activity: ActivityFormData) {
    setEditTarget(activity);
    setModalOpen(true);
  }

  function handleSuccess() {
    showToast(
      editTarget ? "Atividade atualizada com sucesso." : "Atividade criada com sucesso.",
      "success"
    );
    router.refresh();
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-[10px] font-mono text-zinc-600 tabular-nums">
          {activities.length === 0
            ? "Nenhuma atividade"
            : `${activities.length} atividade${activities.length !== 1 ? "s" : ""}`}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 text-zinc-950 text-xs font-mono 
                     font-semibold px-4 py-2 hover:bg-amber-400 transition-colors tracking-wide"
        >
          <span className="text-base leading-none">+</span>
          Nova Atividade
        </button>
      </div>

      {/* Table */}
      <ActivityTable
        activities={activities}
        onEdit={openEdit}
        onToast={showToast}
      />

      {/* Modal */}
      <ActivityFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        initial={editTarget}
      />

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto font-mono text-xs px-4 py-3 shadow-xl 
              border transition-all duration-300 max-w-sm
              ${
                toast.type === "success"
                  ? "bg-green-950 border-green-800 text-green-300"
                  : "bg-red-950 border-red-800 text-red-300"
              }`}
          >
            <span className="mr-2">{toast.type === "success" ? "✓" : "✕"}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}