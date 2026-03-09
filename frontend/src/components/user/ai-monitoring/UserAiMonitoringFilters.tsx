"use client";

import { useEffect, useState } from "react";
import type {
  AiFeatureType,
  AiLogStatus,
  UserAiMonitoringFilters,
} from "@/src/types/user-ai-monitoring.types";

interface UserAiMonitoringFiltersProps {
  filters: UserAiMonitoringFilters;
  isLoading?: boolean;
  onApply: (nextFilters: UserAiMonitoringFilters) => void;
  onReset: () => void;
}

interface DraftFilters {
  dateFrom: string;
  dateTo: string;
  featureType: AiFeatureType | "";
  status: AiLogStatus | "";
  actionType: string;
}

const normalizeDateInput = (value: string): string | undefined => {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(normalized)) {
    return normalized;
  }

  const localPattern = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
  const localMatch = normalized.match(localPattern);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
};

const buildDraft = (filters: UserAiMonitoringFilters): DraftFilters => ({
  dateFrom: filters.dateFrom ?? "",
  dateTo: filters.dateTo ?? "",
  featureType: filters.featureType ?? "",
  status: filters.status ?? "",
  actionType: filters.actionType ?? "",
});

export default function UserAiMonitoringFilters({
  filters,
  isLoading = false,
  onApply,
  onReset,
}: UserAiMonitoringFiltersProps) {
  const [draft, setDraft] = useState<DraftFilters>(() => buildDraft(filters));

  useEffect(() => {
    setDraft(buildDraft(filters));
  }, [filters]);

  const updateDraft = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    let dateFrom = normalizeDateInput(draft.dateFrom);
    let dateTo = normalizeDateInput(draft.dateTo);

    if (dateFrom && dateTo && Date.parse(dateFrom) > Date.parse(dateTo)) {
      const previousFrom = dateFrom;
      dateFrom = dateTo;
      dateTo = previousFrom;
      setDraft((prev) => ({ ...prev, dateFrom, dateTo }));
    }

    onApply({
      ...filters,
      page: 1,
      dateFrom,
      dateTo,
      featureType: draft.featureType || undefined,
      status: draft.status || undefined,
      actionType: draft.actionType.trim() || undefined,
    });
  };

  const handleReset = () => {
    setDraft({
      dateFrom: "",
      dateTo: "",
      featureType: "",
      status: "",
      actionType: "",
    });
    onReset();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 lg:grid-cols-5">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date from</span>
          <input
            type="date"
            value={draft.dateFrom}
            onChange={(event) => updateDraft("dateFrom", event.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date to</span>
          <input
            type="date"
            value={draft.dateTo}
            onChange={(event) => updateDraft("dateTo", event.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>

        <label className="flex flex-col gap-1">
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

        <label className="flex flex-col gap-1">
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

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Action type</span>
          <input
            type="text"
            value={draft.actionType}
            onChange={(event) => updateDraft("actionType", event.target.value)}
            placeholder="e.g. generate_swot"
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
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
