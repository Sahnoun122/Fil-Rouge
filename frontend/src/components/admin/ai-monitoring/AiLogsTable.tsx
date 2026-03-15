"use client";

import type { AdminAiLog, AdminAiLogsResult } from "@/src/types/admin-ai-monitoring.types";
import { Search, ChevronLeft, ChevronRight, Eye, User, Sparkles, AlertCircle } from "lucide-react";

interface AiLogsTableProps {
  logsResult: AdminAiLogsResult | null;
  isLoading?: boolean;
  onPageChange: (nextPage: number) => void;
  onViewDetails: (log: AdminAiLog) => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_FORMATTER.format(date);
};

const formatResponseTime = (value?: number): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `${Math.round(value)} ms`;
};

const formatFeature = (featureType: string): string => {
  const labels: Record<string, string> = {
    strategy: "Stratégie",
    swot: "SWOT",
    content: "Contenu",
    planning: "Planning",
  };
  return labels[featureType] || featureType;
};

const StatusBadge = ({ status }: { status: string }) => {
  const isSuccess = status === "success";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
        isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {isSuccess ? <Sparkles className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {isSuccess ? "Succès" : "Échec"}
    </span>
  );
};

export default function AiLogsTable({
  logsResult,
  isLoading = false,
  onPageChange,
  onViewDetails,
}: AiLogsTableProps) {
  const logs = logsResult?.logs ?? [];
  const page = logsResult?.page ?? 1;
  const totalPages = logsResult?.totalPages ?? 1;
  const total = logsResult?.total ?? 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Journaux d'Activité IA</h2>
            <p className="text-sm text-slate-500">Historique détaillé des requêtes</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            Total : {total} logs
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Utilisateur</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Fonctionnalité</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Latence</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Détails</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                        <div className="h-2.5 w-48 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-900">Aucun journal trouvé</p>
                    <p className="text-xs">Essayez de modifier vos filtres de recherche.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="align-middle transition-colors hover:bg-slate-50/80">
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{log.user?.fullName || "Anonyme"}</p>
                        <p className="truncate text-[11px] text-slate-500">{log.user?.email || "-"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Feature */}
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {formatFeature(log.featureType)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5">
                    <p className="max-w-[240px] truncate text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded">
                      {log.actionType}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={log.status} />
                  </td>

                  {/* Response Time */}
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                    {formatResponseTime(log.responseTimeMs)}
                  </td>

                  {/* Date format */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                    {formatDate(log.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(log)}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Voir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
        <p className="text-sm text-slate-500">
          Page <span className="font-semibold text-slate-800">{page}</span> sur <span className="font-semibold text-slate-800">{totalPages}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}
