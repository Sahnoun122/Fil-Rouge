'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminContents } from '@/src/hooks/useAdmin';
import { Megaphone, Search, RefreshCw, X, ChevronRight, ChevronLeft, Eye, Building2, User, Globe, Target } from 'lucide-react';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
});

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return DATE_FORMATTER.format(date);
};

const formatMode = (value: string): string => {
  return value === 'ADS' ? 'Publicités' : 'Contenu';
};

const formatObjective = (value: string): string => {
  const labels: Record<string, string> = {
    leads: 'Acquisition',
    sales: 'Ventes',
    awareness: 'Notoriété',
    engagement: 'Engagement',
  };
  return labels[value] || value;
};

export default function AdminContentPage() {
  const {
    campaigns,
    contentsResult,
    error,
    isLoadingContents,
    loadContents,
    clearError,
  } = useAdminContents({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContents({
        page: 1,
        limit: 10,
        search: searchInput,
      }).catch(() => undefined);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput, loadContents]);

  const currentPage = contentsResult?.page ?? 1;
  const totalPages = contentsResult?.totalPages ?? 1;
  const totalCampaigns = contentsResult?.total ?? 0;

  const onPageChange = async (page: number) => {
    if (page < 1 || page > totalPages || isLoadingContents) return;
    try {
       await loadContents({ page, limit: 10, search: searchInput });
    } catch { /* handled */ }
  };

  const handleRefresh = () => {
    void loadContents({ page: currentPage, limit: 10, search: searchInput });
  };

  return (
    <section className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm">
         <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl" />
         <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-blue-200/25 blur-3xl" />

         <div className="relative flex flex-wrap items-start justify-between gap-4">
           <div className="space-y-2">
             <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
               <Megaphone className="w-3 h-3" />
               Diffusion Studio
             </span>
             <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
               Campagnes de Contenu
             </h1>
             <p className="max-w-xl text-sm text-slate-500">
               Vue globale des campagnes de contenus et publicités générées par vos utilisateurs.
             </p>
           </div>

           <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-95"
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
                 placeholder="Rechercher (utilisateur, campagne, entreprise)..."
                 className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                 type="text"
               />
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              Total : {totalCampaigns} campagnes
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
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Campagne / Entreprise</th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Type & Objectif</th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Détails</th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoadingContents ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="px-5 py-4">
                           <div className="flex items-center gap-3">
                             <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
                             <div className="space-y-1.5">
                                <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                                <div className="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
                             </div>
                           </div>
                        </td>
                      </tr>
                    ))
                  ) : campaigns.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="px-5 py-12 text-center text-sm">
                         <div className="flex flex-col items-center gap-2 text-slate-500">
                           <Megaphone className="w-8 h-8 text-slate-300" />
                           <p className="font-semibold text-slate-900">Aucune campagne de contenu trouvée</p>
                           <p className="text-xs">Essayez de modifier votre recherche.</p>
                         </div>
                       </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="align-middle transition-colors hover:bg-slate-50/80">
                         <td className="px-5 py-3.5">
                           <div className="flex items-start gap-3">
                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                               <Megaphone className="w-5 h-5" />
                             </div>
                             <div className="min-w-0">
                               <p className="truncate font-bold text-slate-900">{campaign.name}</p>
                               <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                 <Building2 className="w-3.5 h-3.5" />
                                 <span className="truncate max-w-[150px]">{campaign.strategy.businessName}</span>
                                 <span className="text-slate-300 mx-1">•</span>
                                 <User className="w-3.5 h-3.5" />
                                 <span className="truncate max-w-[120px]">{campaign.user.fullName || campaign.user.email}</span>
                               </div>
                             </div>
                           </div>
                         </td>

                         <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                               <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${campaign.mode === 'ADS' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                 {formatMode(campaign.mode)}
                               </span>
                               <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                 <Target className="w-3 h-3" />
                                 {formatObjective(campaign.objective)}
                               </span>
                            </div>
                         </td>

                         <td className="px-4 py-3.5">
                           <div className="space-y-1">
                             <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                               <Globe className="w-3.5 h-3.5 text-slate-400" /> 
                               <span className="truncate max-w-[120px]">{campaign.platforms.length > 0 ? campaign.platforms.join(', ') : '-'}</span>
                             </div>
                             <p className="text-[11px] text-slate-500">
                               {campaign.generatedPostsCount} posts générés • {formatDate(campaign.createdAt)}
                             </p>
                           </div>
                         </td>

                         <td className="px-4 py-3.5 text-right">
                           <Link
                             href={`/admin/content/${campaign.id}`}
                             className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                           >
                             <Eye className="w-3.5 h-3.5" />
                             Voir la camp.
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
                disabled={currentPage <= 1 || isLoadingContents}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => void onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoadingContents}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
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
