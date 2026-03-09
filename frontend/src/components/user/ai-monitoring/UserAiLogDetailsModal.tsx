"use client";

import type { UserAiLog } from "@/src/types/user-ai-monitoring.types";

interface UserAiLogDetailsModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  log: UserAiLog | null;
  onClose: () => void;
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

const PanelField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      {value && value.trim().length > 0 ? value : "-"}
    </p>
  </div>
);

export default function UserAiLogDetailsModal({
  isOpen,
  isLoading = false,
  log,
  onClose,
}: UserAiLogDetailsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">My AI log details</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">
              {log?.actionType || "Loading..."}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{formatDate(log?.createdAt)}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </header>

        <div className="max-h-[calc(90vh-74px)] space-y-4 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : !log ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Unable to load log details.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <PanelField label="Feature" value={log.featureType} />
                <PanelField label="Status" value={log.status} />
                <PanelField
                  label="Response Time"
                  value={
                    typeof log.responseTimeMs === "number"
                      ? `${Math.round(log.responseTimeMs)} ms`
                      : undefined
                  }
                />
                <PanelField label="Model Name" value={log.modelName} />
                <PanelField label="Related Entity" value={log.relatedEntityId} />
                <PanelField label="Date" value={formatDate(log.createdAt)} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Input Summary</p>
                <pre className="max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {log.inputSummary || "-"}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Response Summary</p>
                <pre className="max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {log.responseSummary || "-"}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Error Message</p>
                <pre className="max-h-32 overflow-auto rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700 whitespace-pre-wrap">
                  {log.errorMessage || "-"}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
