import { Suspense } from "react";
import { getActivities } from "@/app/actions/activityActions";
import { ActivityFilters } from "@/components/ActivityFilters";
import { ActivityDashboard } from "@/components/ActivityDashboard";

type PageProps = {
  searchParams: {
    priority?: string;
    category?: string;
    status?: string;
    team?: string;
    assignee?: string;
  };
};

export default async function HomePage({ searchParams }: PageProps) {
  const result = await getActivities({
    priority: searchParams.priority as never,
    category: searchParams.category as never,
    status: searchParams.status as never,
    team: searchParams.team,
    assignee: searchParams.assignee,
  });

  const activities = result.success ? result.data : [];

  // Metrics for header badges
  const total = activities.length;
  const critical = activities.filter((a) => a.priority === "CRITICA").length;
  const inProgress = activities.filter((a) => a.status === "EM_ANDAMENTO").length;
  const blocked = activities.filter((a) => a.status === "BLOQUEADA").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="w-7 h-7 bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-mono font-bold text-zinc-950">AT</span>
            </div>
            <div>
              <h1 className="text-sm font-mono font-semibold text-zinc-100 tracking-wide leading-none">
                Controle de Atividades
              </h1>
              <p className="text-[10px] font-mono text-zinc-600 mt-0.5 hidden sm:block">
                Sistema de gestão de demandas internas
              </p>
            </div>
          </div>

          {/* Metrics badges */}
          <div className="hidden sm:flex items-center gap-4 font-mono text-[10px]">
            <Metric label="Total" value={total} color="text-zinc-400" />
            {critical > 0 && (
              <Metric label="Críticas" value={critical} color="text-red-400" />
            )}
            {inProgress > 0 && (
              <Metric label="Em andamento" value={inProgress} color="text-amber-400" />
            )}
            {blocked > 0 && (
              <Metric label="Bloqueadas" value={blocked} color="text-red-500" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Filter bar */}
        <Suspense fallback={<FilterSkeleton />}>
          <ActivityFilters />
        </Suspense>

        {/* Error state */}
        {!result.success && (
          <div className="border border-red-900 bg-red-950/30 px-4 py-3 font-mono text-xs text-red-400">
            Ocorreu um erro ao processar sua solicitação. Tente novamente.
          </div>
        )}

        {/* Main dashboard — client component handles modal state */}
        <ActivityDashboard activities={activities} />
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-lg font-semibold tabular-nums ${color}`}>{value}</span>
      <span className="text-zinc-700">{label}</span>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="border border-zinc-800 bg-zinc-950 p-4 h-[72px] animate-pulse" />
  );
}