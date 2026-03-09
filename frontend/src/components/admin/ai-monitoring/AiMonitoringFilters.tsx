"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminAiMonitoringFilters,
  AdminAiUsageByUserItem,
  AiFeatureType,
  AiLogStatus,
} from "@/src/types/admin-ai-monitoring.types";

interface AiMonitoringFiltersProps {
  filters: AdminAiMonitoringFilters;
  users: AdminAiUsageByUserItem[];
  isLoading?: boolean;
  onApply: (nextFilters: AdminAiMonitoringFilters) => void;
  onReset: () => void;
}

interface DraftFilters {
  dateFrom: string;
  dateTo: string;
  featureType: AiFeatureType | "";
  status: AiLogStatus | "";
  userId: string;
}

const buildDraft = (filters: AdminAiMonitoringFilters): DraftFilters => ({
  dateFrom: filters.dateFrom ?? "",
  dateTo: filters.dateTo ?? "",
  featureType: filters.featureType ?? "",
  status: filters.status ?? "",
  userId: filters.userId ?? "",
});

export default function AiMonitoringFilters({
  filters,
  users,
  isLoading = false,
  onApply,
  onReset,
}: AiMonitoringFiltersProps) {
  const [draft, setDraft] = useState<DraftFilters>(() => buildDraft(filters));

  useEffect(() => {
    setDraft(buildDraft(filters));
  }, [filters]);

  const userOptions = useMemo(() => {
    const dedup = new Map<string, string>();

    for (const item of users) {
      if (!item.userId) {
        continue;
      }

      if (dedup.has(item.userId)) {
        continue;
      }

      const fullName = item.user?.fullName?.trim() || "Utilisateur";
      const email = item.user?.email?.trim() || "";
      dedup.set(item.userId, email ? `${fullName} (${email})` : fullName);
    }

    return Array.from(dedup.entries()).map(([id, label]) => ({ id, label }));
  }, [users]);

  const updateDraft = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply({
      ...filters,
      page: 1,
      dateFrom: draft.dateFrom || undefined,
      dateTo: draft.dateTo || undefined,
      featureType: draft.featureType || undefined,
      status: draft.status || undefined,
      userId: draft.userId || undefined,
    });
  };

  const handleReset = () => {
    setDraft({
      dateFrom: "",
      dateTo: "",
      featureType: "",
      status: "",
      userId: "",
    });
    onReset();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date from</span>
          <input
            type="date"
            value={draft.dateFrom}
            onChange={(event) => updateDraft("dateFrom", event.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date to</span>
          <input
            type="date"
            value={draft.dateTo}
            onChange={(event) => updateDraft("dateTo", event.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feature</span>
          <select
            value={draft.featureType}
            onChange={(event) => updateDraft("featureType", event.target.value as AiFeatureType | "")}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All features</option>
            <option value="strategy">Strategy</option>
            <option value="swot">SWOT</option>
            <option value="content">Content</option>
            <option value="planning">Planning</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
          <select
            value={draft.status}
            onChange={(event) => updateDraft("status", event.target.value as AiLogStatus | "")}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">User</span>
          <select
            value={draft.userId}
            onChange={(event) => updateDraft("userId", event.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All users</option>
            {userOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading}
          className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
