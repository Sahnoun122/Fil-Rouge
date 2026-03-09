"use client";

import { useEffect, useRef, useState } from "react";
import AdminService from "@/src/services/adminService";
import type { AdminUser } from "@/src/types/admin.types";
import type {
  AdminAiMonitoringFilters,
  AiFeatureType,
  AiLogStatus,
} from "@/src/types/admin-ai-monitoring.types";

interface AiMonitoringFiltersProps {
  filters: AdminAiMonitoringFilters;
  isLoading?: boolean;
  onApply: (nextFilters: AdminAiMonitoringFilters) => void;
  onReset: () => void;
}

interface DraftFilters {
  dateFrom: string;
  dateTo: string;
  featureType: AiFeatureType | "";
  status: AiLogStatus | "";
  userSearch: string;
}

const USER_SEARCH_MIN_LENGTH = 2;
const USER_SUGGESTIONS_LIMIT = 8;

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

const buildDraft = (filters: AdminAiMonitoringFilters): DraftFilters => ({
  dateFrom: filters.dateFrom ?? "",
  dateTo: filters.dateTo ?? "",
  featureType: filters.featureType ?? "",
  status: filters.status ?? "",
  userSearch: filters.userSearch ?? "",
});

export default function AiMonitoringFilters({
  filters,
  isLoading = false,
  onApply,
  onReset,
}: AiMonitoringFiltersProps) {
  const [draft, setDraft] = useState<DraftFilters>(() => buildDraft(filters));
  const [userSuggestions, setUserSuggestions] = useState<AdminUser[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const suggestionsRequestIdRef = useRef(0);
  const userSearchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft(buildDraft(filters));
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userSearchContainerRef.current) {
        return;
      }

      const target = event.target as Node | null;
      if (target && !userSearchContainerRef.current.contains(target)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = draft.userSearch.trim();
    const requestId = ++suggestionsRequestIdRef.current;

    if (query.length < USER_SEARCH_MIN_LENGTH) {
      setUserSuggestions([]);
      setIsSuggestionsLoading(false);
      return;
    }

    setIsSuggestionsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await AdminService.getUsers({
          page: 1,
          limit: USER_SUGGESTIONS_LIMIT,
          search: query,
        });

        if (requestId !== suggestionsRequestIdRef.current) {
          return;
        }

        setUserSuggestions(result.users);
        setIsSuggestionsOpen(true);
      } catch {
        if (requestId !== suggestionsRequestIdRef.current) {
          return;
        }

        setUserSuggestions([]);
      } finally {
        if (requestId === suggestionsRequestIdRef.current) {
          setIsSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draft.userSearch]);

  const updateDraft = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserSearchChange = (value: string) => {
    updateDraft("userSearch", value);

    if (value.trim().length >= USER_SEARCH_MIN_LENGTH) {
      setIsSuggestionsOpen(true);
    } else {
      setIsSuggestionsOpen(false);
    }
  };

  const handleSelectUserSuggestion = (user: AdminUser) => {
    const nextValue = (user.email || user.fullName || "").trim();
    updateDraft("userSearch", nextValue);
    setIsSuggestionsOpen(false);
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
      userSearch: draft.userSearch.trim() || undefined,
      userId: undefined,
    });
  };

  const handleReset = () => {
    setDraft({
      dateFrom: "",
      dateTo: "",
      featureType: "",
      status: "",
      userSearch: "",
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
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">User search</span>
          <div ref={userSearchContainerRef} className="relative">
            <input
              type="text"
              value={draft.userSearch}
              onChange={(event) => handleUserSearchChange(event.target.value)}
              onFocus={() => {
                if (draft.userSearch.trim().length >= USER_SEARCH_MIN_LENGTH) {
                  setIsSuggestionsOpen(true);
                }
              }}
              placeholder="Name, surname or email"
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />

            {isSuggestionsOpen && draft.userSearch.trim().length >= USER_SEARCH_MIN_LENGTH ? (
              <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {isSuggestionsLoading ? (
                  <p className="px-3 py-2 text-sm text-slate-500">Searching users...</p>
                ) : userSuggestions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">No user found</p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {userSuggestions.map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectUserSuggestion(user)}
                          className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <span className="truncate text-sm font-medium text-slate-800">
                            {user.fullName || "Utilisateur"}
                          </span>
                          <span className="truncate text-xs text-slate-500">{user.email || "-"}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
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
