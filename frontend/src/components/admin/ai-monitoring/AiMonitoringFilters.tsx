"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
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
  if (!normalized) return undefined;

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(normalized)) return normalized;

  const localPattern = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
  const localMatch = normalized.match(localPattern);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;

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
  const userSearchContainerRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    setDraft(buildDraft(filters));
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userSearchContainerRef.current) return;
      const target = event.target as Node | null;
      if (target && !userSearchContainerRef.current.contains(target)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const result = await AdminService.getUsers({ page: 1, limit: USER_SUGGESTIONS_LIMIT, search: query });
        if (requestId !== suggestionsRequestIdRef.current) return;
        setUserSuggestions(result.users);
        setIsSuggestionsOpen(true);
      } catch {
        if (requestId !== suggestionsRequestIdRef.current) return;
        setUserSuggestions([]);
      } finally {
        if (requestId === suggestionsRequestIdRef.current) {
          setIsSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [draft.userSearch]);

  const updateDraft = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserSearchChange = (value: string) => {
    updateDraft("userSearch", value);
    if (value.trim().length >= USER_SEARCH_MIN_LENGTH) setIsSuggestionsOpen(true);
    else setIsSuggestionsOpen(false);
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
      setDraft((prev) => ({ ...prev, dateFrom: dateFrom ?? "", dateTo: dateTo ?? "" }));
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
    setDraft({ dateFrom: "", dateTo: "", featureType: "", status: "", userSearch: "" });
    onReset();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Filter Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-800">Filtres de recherche</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Du</span>
            <input
              type="date"
              value={draft.dateFrom}
              onChange={(e) => updateDraft("dateFrom", e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Au</span>
            <input
              type="date"
              value={draft.dateTo}
              onChange={(e) => updateDraft("dateTo", e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </label>

          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fonctionnalité</span>
            <select
              value={draft.featureType}
              onChange={(e) => updateDraft("featureType", e.target.value as AiFeatureType | "")}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            >
              <option value="">Toutes les fonctionnalités</option>
              <option value="strategy">Stratégie</option>
              <option value="swot">SWOT</option>
              <option value="content">Contenu</option>
              <option value="planning">Planning</option>
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Statut</span>
            <select
              value={draft.status}
              onChange={(e) => updateDraft("status", e.target.value as AiLogStatus | "")}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            >
              <option value="">Tous les statuts</option>
              <option value="success">Succès</option>
              <option value="failed">Échec</option>
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1.5 relative" ref={userSearchContainerRef}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Utilisateur</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={draft.userSearch}
                onChange={(e) => handleUserSearchChange(e.target.value)}
                onFocus={() => {
                  if (draft.userSearch.trim().length >= USER_SEARCH_MIN_LENGTH) setIsSuggestionsOpen(true);
                }}
                placeholder="Nom, prénom ou email..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
              />

              {isSuggestionsOpen && draft.userSearch.trim().length >= USER_SEARCH_MIN_LENGTH && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                  {isSuggestionsLoading ? (
                    <p className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Recherche...
                    </p>
                  ) : userSuggestions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500">Aucun utilisateur trouvé</p>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto py-1.5">
                      {userSuggestions.map((user) => (
                        <li key={user.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectUserSuggestion(user)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-purple-50"
                          >
                            <span className="truncate text-sm font-semibold text-slate-800">
                              {user.fullName || "Utilisateur"}
                            </span>
                            <span className="truncate text-[11px] text-slate-500">{user.email || "-"}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Filter className="w-4 h-4" />
            Appliquer les filtres
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </div>
    </section>
  );
}
