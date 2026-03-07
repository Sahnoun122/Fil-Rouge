'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAdminSwots } from '@/src/hooks/useAdmin';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
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

const matrixTotal = (items?: string[]): number => (Array.isArray(items) ? items.length : 0);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSwots({
        page: 1,
        limit: 10,
        search: searchInput,
      }).catch(() => undefined);
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
    if (page < 1 || page > totalPages || isLoadingSwots) {
      return;
    }

    try {
      await loadSwots({
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
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">SWOT Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          View all user SWOT analyses linked to their marketing strategies.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total SWOT</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalSwots}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">AI (current page)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{aiGeneratedOnPage}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Page</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {currentPage} / {totalPages}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nom user, email, titre SWOT, business"
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            type="text"
          />
        </label>

        {error ? (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              type="button"
            >
              Close
            </button>
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Strategy</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">SWOT Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">IA</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Points</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Created on</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoadingSwots ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      Loading SWOT analyses...
                    </td>
                  </tr>
                ) : swots.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      No SWOT found.
                    </td>
                  </tr>
                ) : (
                  swots.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{item.user.fullName}</p>
                        <p className="text-xs text-slate-500">{item.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium">{item.strategy.businessName}</p>
                        <p className="text-xs text-slate-500">{item.strategy.industry}</p>
                        <Link
                          href={`/admin/strategies/${item.strategyId}`}
                          className="mt-1 inline-flex text-xs font-semibold text-cyan-700 hover:underline"
                        >
                          View linked strategy
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.isAiGenerated
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.isAiGenerated ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        S:{matrixTotal(item.swot.strengths)} / W:{matrixTotal(item.swot.weaknesses)} / O:
                        {matrixTotal(item.swot.opportunities)} / T:{matrixTotal(item.swot.threats)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/swot-analytics/${item.id}`}
                          className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View
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
          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{totalSwots}</span> SWOT
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingSwots}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingSwots}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}
