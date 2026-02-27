'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminStrategies } from '@/src/hooks/useAdmin';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDate = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return DATE_FORMATTER.format(date);
};

const formatObjective = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const labels: Record<string, string> = {
    leads: 'Leads',
    sales: 'Ventes',
    awareness: 'Notoriete',
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
    if (page < 1 || page > totalPages || isLoadingStrategies) {
      return;
    }

    try {
      await loadStrategies({
        page,
        limit: 10,
        search: searchInput,
      });
    } catch {
      // handled by hook state
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Administration</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Strategies marketing des utilisateurs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Consultez les strategies generees par chaque utilisateur.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recherche</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nom user, email, entreprise, business"
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              type="text"
            />
          </label>

          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{totalStrategies}</span> strategies
          </p>
        </div>

        {error ? (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              type="button"
            >
              Fermer
            </button>
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Entreprise</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Business</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Objectif</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Cree le</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoadingStrategies ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      Chargement des strategies...
                    </td>
                  </tr>
                ) : strategies.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      Aucune strategie trouvee.
                    </td>
                  </tr>
                ) : (
                  strategies.map((strategy) => (
                    <tr key={strategy.id} className="align-middle">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{strategy.user.fullName || '-'}</p>
                        <p className="text-xs text-slate-500">{strategy.user.role === 'admin' ? 'Admin' : 'User'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{strategy.user.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{strategy.user.companyName || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{strategy.businessInfo.businessName}</td>
                      <td className="px-4 py-3 text-slate-700">{formatObjective(strategy.businessInfo.mainObjective)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(strategy.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/strategies/${strategy.id}`}
                          className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Consulter
                        </Link>
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
            Page {currentPage} / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingStrategies}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Precedent
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingStrategies}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Suivant
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}
