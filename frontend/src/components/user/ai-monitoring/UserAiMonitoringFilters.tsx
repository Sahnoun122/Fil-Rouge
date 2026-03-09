"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import UserAiMonitoringService from "@/src/services/userAiMonitoringService";
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

const ACTION_SUGGESTIONS_LIMIT = 8;
const DEFAULT_ACTION_EXAMPLES = [
  "generate_full_strategy",
  "regenerate_section",
  "improve_section",
  "generate_swot_from_strategy",
  "improve_swot",
  "generate_campaign_content",
  "regenerate_platform_content",
  "regenerate_single_post",
  "generate_auto_schedule_advice",
];

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
  const [actionSuggestions, setActionSuggestions] = useState<string[]>([]);
  const [isActionSuggestionsLoading, setIsActionSuggestionsLoading] = useState(false);

  const actionSuggestionsRequestIdRef = useRef(0);

  useEffect(() => {
    setDraft(buildDraft(filters));
  }, [filters]);

  useEffect(() => {
    const requestId = ++actionSuggestionsRequestIdRef.current;

    setIsActionSuggestionsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const suggestions = await UserAiMonitoringService.getActionTypeSuggestions(
          {
            dateFrom: draft.dateFrom || undefined,
            dateTo: draft.dateTo || undefined,
            featureType: draft.featureType || undefined,
            status: draft.status || undefined,
          },
          draft.actionType.trim(),
          ACTION_SUGGESTIONS_LIMIT,
        );

        if (requestId !== actionSuggestionsRequestIdRef.current) {
          return;
        }

        const normalizedQuery = draft.actionType.trim().toLowerCase();
        const fallbackSuggestions = DEFAULT_ACTION_EXAMPLES.filter((item) =>
          normalizedQuery ? item.toLowerCase().includes(normalizedQuery) : true,
        ).slice(0, ACTION_SUGGESTIONS_LIMIT);

        setActionSuggestions(
          suggestions.length > 0 ? suggestions : fallbackSuggestions,
        );
      } catch {
        if (requestId !== actionSuggestionsRequestIdRef.current) {
          return;
        }

        const normalizedQuery = draft.actionType.trim().toLowerCase();
        const fallbackSuggestions = DEFAULT_ACTION_EXAMPLES.filter((item) =>
          normalizedQuery ? item.toLowerCase().includes(normalizedQuery) : true,
        ).slice(0, ACTION_SUGGESTIONS_LIMIT);

        setActionSuggestions(fallbackSuggestions);
      } finally {
        if (requestId === actionSuggestionsRequestIdRef.current) {
          setIsActionSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draft.actionType, draft.dateFrom, draft.dateTo, draft.featureType, draft.status]);

  const updateDraft = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const suggestionOptions = useMemo(() => {
    if (actionSuggestions.length > 0) {
      return actionSuggestions;
    }

    const normalizedQuery = draft.actionType.trim().toLowerCase();
    return DEFAULT_ACTION_EXAMPLES.filter((item) =>
      normalizedQuery ? item.toLowerCase().includes(normalizedQuery) : true,
    ).slice(0, ACTION_SUGGESTIONS_LIMIT);
  }, [actionSuggestions, draft.actionType]);

  const handleApply = () => {
    let dateFrom = normalizeDateInput(draft.dateFrom);
    let dateTo = normalizeDateInput(draft.dateTo);

    if (dateFrom && dateTo && Date.parse(dateFrom) > Date.parse(dateTo)) {
      const previousFrom = dateFrom;
      dateFrom = dateTo;
      dateTo = previousFrom;
      setDraft((prev) => ({ ...prev, dateFrom: dateFrom ?? "", dateTo: dateTo ?? "" }));
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
            placeholder="e.g. generate_swot_from_strategy"
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          <p className="text-[11px] text-slate-500">
            {isActionSuggestionsLoading
              ? "Loading action suggestions..."
              : `${suggestionOptions.length} suggestions available`}
          </p>
          {suggestionOptions.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {suggestionOptions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => updateDraft("actionType", suggestion)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    draft.actionType === suggestion
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
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
