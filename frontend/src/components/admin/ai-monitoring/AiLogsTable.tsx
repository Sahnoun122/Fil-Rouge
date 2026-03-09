"use client";

import type { AdminAiLog, AdminAiLogsResult } from "@/src/types/admin-ai-monitoring.types";

interface AiLogsTableProps {
  logsResult: AdminAiLogsResult | null;
  isLoading?: boolean;
  onPageChange: (nextPage: number) => void;
  onViewDetails: (log: AdminAiLog) => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return DATE_FORMATTER.format(date);
};

const formatResponseTime = (value?: number): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${Math.round(value)} ms`;
};

const formatFeature = (featureType: string): string => {
  const labels: Record<string, string> = {
    strategy: "Strategy",
    swot: "SWOT",
    content: "Content",
    planning: "Planning",
  };

  return labels[featureType] || featureType;
};

const StatusBadge = ({ status }: { status: string }) => {
  const className =
    status === "success"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {status === "success" ? "Success" : "Failed"}
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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">AI Logs</h2>
          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{total}</span> logs
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Feature</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Response Time</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-500" colSpan={7}>
                    No AI logs found for the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="align-middle">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {log.user?.fullName || "Utilisateur"}
                      </p>
                      <p className="text-xs text-slate-500">{log.user?.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatFeature(log.featureType)}</td>
                    <td className="px-4 py-3">
                      <p className="max-w-[280px] truncate text-slate-700">{log.actionType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatResponseTime(log.responseTimeMs)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onViewDetails(log)}
                        className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="text-sm text-slate-600">
          Page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}
