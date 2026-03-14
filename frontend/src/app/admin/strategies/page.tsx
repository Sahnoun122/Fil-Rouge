'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminStrategies } from '@/src/hooks/useAdmin';
import { Target, Search, RefreshCw, X, ChevronRight, ChevronLeft, Eye, Building2, User } from 'lucide-react';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
});

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return DATE_FORMATTER.format(date);
};

const formatObjective = (value?: string): string => {
  if (!value) return '-';
  const labels: Record<string, string> = {
    leads: 'Acquisition',
    sales: 'Ventes',
    awareness: 'Notoriété',
    engagement: 'Engagement',
  };
  return labels[value] || value;
};

export default function AdminStrategiesPage() {
  const {
    strategies,
    strategiesResult,
    error,
    isLoadingStrategies,
    loadStrategies,
    clearError,
  } = useAdminStrategies({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStrategies({
        page: 1,
        limit: 10,
        search: searchInput,
      }).catch(() => undefined);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput, loadStrategies]);

  const currentPage = strategiesResult?.page ?? 1;
  const totalPages = strategiesResult?.totalPages ?? 1;
  const totalStrategies = strategiesResult?.total ?? 0;

  const onPageChange = async (page: number) => {
    if (page < 1 || page > totalPages || isLoadingStrategies) return;
    try {
      await loadStrategies({ page, limit: 10, search: searchInput });
    } catch { /* handled */ }
  };

  const handleRefresh = () => {
    void loadStrategies({ page: currentPage, limit: 10, search: searchInput });
  };

  return (
    <section className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
              <Target className="w-3 h-3" />
              Intelligence Center
            </span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Stratégies IA
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              Vision globale des stratégies marketing générées par l'intelligence artificielle pour vos utilisateurs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 active:scale-95"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters bar */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher (nom, email, entreprise, business)..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
                type="text"
              />
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              Total : {totalStrategies} stratégies
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={clearError} className="rounded-md p-1 text-red-500 transition hover:bg-red-100" type="button">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Business / Client</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Objectif principal</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Généré le</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoadingStrategies ? (
                   [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-5 py-4">
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
                ) : strategies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Target className="w-8 h-8 text-slate-300" />
                        <p className="font-semibold text-slate-900">Aucune stratégie trouvée</p>
                        <p className="text-xs">Essayez de modifier votre recherche.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  strategies.map((strategy) => (
                    <tr key={strategy.id} className="align-middle transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{strategy.businessInfo.businessName}</p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate">{strategy.user.fullName || strategy.user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          {formatObjective(strategy.businessInfo.mainObjective)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                        {formatDate(strategy.createdAt)}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/strategies/${strategy.id}`}
                          className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Voir la strat.
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> sur <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingStrategies}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => void onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingStrategies}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}
