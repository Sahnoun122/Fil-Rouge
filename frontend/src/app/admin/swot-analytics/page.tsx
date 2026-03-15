'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Download, Search, RefreshCw, X, ChevronRight, ChevronLeft, Eye, BarChart2, User, Building2, Sparkles, PenLine } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminSwots } from '@/src/hooks/useAdmin';
import AdminService from '@/src/services/adminService';
import { generateSwotPdf } from '@/src/lib/swotPdf';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
});

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return DATE_FORMATTER.format(date);
};

const matrixTotal = (items?: string[]): number => (Array.isArray(items) ? items.length : 0);

const SwotScoreBadge = ({ swot }: { swot: { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] } }) => {
  const s = matrixTotal(swot.strengths);
  const w = matrixTotal(swot.weaknesses);
  const o = matrixTotal(swot.opportunities);
  const t = matrixTotal(swot.threats);
  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold">
      <span className="rounded px-1.5 py-0.5 bg-emerald-100 text-emerald-700">{s}S</span>
      <span className="rounded px-1.5 py-0.5 bg-rose-100 text-rose-700">{w}W</span>
      <span className="rounded px-1.5 py-0.5 bg-cyan-100 text-cyan-700">{o}O</span>
      <span className="rounded px-1.5 py-0.5 bg-amber-100 text-amber-700">{t}T</span>
    </div>
  );
};

export default function AdminSwotAnalyticsPage() {
  const {
    swots,
    swotsResult,
    error,
    isLoadingSwots,
    loadSwots,
    clearError,
  } = useAdminSwots({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState('');
  const [downloadingSwotId, setDownloadingSwotId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSwots({ page: 1, limit: 10, search: searchInput }).catch(() => undefined);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchInput, loadSwots]);

  const currentPage = swotsResult?.page ?? 1;
  const totalPages = swotsResult?.totalPages ?? 1;
  const totalSwots = swotsResult?.total ?? 0;

  const aiGeneratedOnPage = useMemo(
    () => swots.filter((item) => item.isAiGenerated).length,
    [swots],
  );

  const onPageChange = async (page: number) => {
    if (page < 1 || page > totalPages || isLoadingSwots) return;
    try {
      await loadSwots({ page, limit: 10, search: searchInput });
    } catch { /* handled */ }
  };

  const handleRefresh = () => {
    void loadSwots({ page: currentPage, limit: 10, search: searchInput });
  };

  const handleDownloadPdf = async (swotId: string) => {
    setDownloadingSwotId(swotId);
    try {
      const payload = await AdminService.getSwotPdfPayload(swotId);
      generateSwotPdf(payload);
      toast.success('PDF SWOT généré avec succès');
    } catch {
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingSwotId(null);
    }
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
              <BarChart2 className="w-3 h-3" />
              Analyse Stratégique
            </span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              SWOT Analytics
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              Vue globale de toutes les analyses SWOT générées par les utilisateurs, liées à leurs stratégies marketing.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 active:scale-95"
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition hover:shadow-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-100/50 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 border border-purple-200">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total SWOT</p>
              <p className="text-2xl font-black text-slate-900">{totalSwots}</p>
            </div>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition hover:shadow-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-100/50 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Générés par IA</p>
              <p className="text-2xl font-black text-slate-900">{aiGeneratedOnPage}</p>
            </div>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm transition hover:shadow-md">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-indigo-100/50 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manuels</p>
              <p className="text-2xl font-black text-slate-900">{swots.length - aiGeneratedOnPage}</p>
            </div>
          </div>
        </article>
      </section>

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
                placeholder="Rechercher (nom, email, titre SWOT, business)..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
                type="text"
              />
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              Total : {totalSwots} analyses
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
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Utilisateur</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Stratégie liée</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Titre SWOT</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Points</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Créé le</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoadingSwots ? (
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
                ) : swots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <BarChart2 className="w-8 h-8 text-slate-300" />
                        <p className="font-semibold text-slate-900">Aucune analyse SWOT trouvée</p>
                        <p className="text-xs">Essayez de modifier votre recherche.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  swots.map((item) => (
                    <tr key={item.id} className="align-middle transition-colors hover:bg-slate-50/80">
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{item.user.fullName}</p>
                            <p className="truncate text-xs text-slate-500">{item.user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Strategy */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 text-xs">{item.strategy.businessName}</p>
                            <p className="truncate text-[11px] text-slate-500">{item.strategy.industry}</p>
                          </div>
                        </div>
                      </td>

                      {/* SWOT Title */}
                      <td className="px-4 py-3.5">
                        <p className="max-w-[160px] truncate font-medium text-slate-800">{item.title}</p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        {item.isAiGenerated ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <Sparkles className="w-3 h-3" />
                            IA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                            <PenLine className="w-3 h-3" />
                            Manuel
                          </span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3.5">
                        <SwotScoreBadge swot={item.swot} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/swot-analytics/${item.id}`}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voir
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(item.id)}
                            disabled={downloadingSwotId === item.id}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 text-xs font-bold text-purple-700 shadow-sm transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloadingSwotId === item.id ? '…' : 'PDF'}
                          </button>
                        </div>
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
            Page <span className="font-semibold text-slate-800">{currentPage}</span> sur{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingSwots}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => void onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingSwots}
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
