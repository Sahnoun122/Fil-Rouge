'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Plus,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import UserLayout from '@/src/components/layout/UserLayout';
import { api } from '@/src/utils/fetcher';

interface SwotMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotItem {
  _id: string;
  strategyId: string;
  title: string;
  swot: SwotMatrix;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SwotListPayload {
  swots: SwotItem[];
  pagination: PaginationInfo;
}

const DEFAULT_LIMIT = 12;

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const getTotalPoints = (swot: SwotMatrix): number =>
  swot.strengths.length + swot.weaknesses.length + swot.opportunities.length + swot.threats.length;

export default function SwotListPage() {
  const [swots, setSwots] = useState<SwotItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSwots = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<SwotListPayload>(
        `/swot?page=${page}&limit=${DEFAULT_LIMIT}`,
        true,
      );
      const payload = response.data;

      if (!payload) {
        throw new Error('Reponse SWOT invalide');
      }

      setSwots(payload.swots ?? []);
      setPagination(
        payload.pagination ?? {
          page,
          limit: DEFAULT_LIMIT,
          total: payload.swots?.length ?? 0,
          pages: 1,
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des SWOT');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSwots(1);
  }, []);

  const filteredSwots = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return swots;

    return swots.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.strategyId.toLowerCase().includes(normalized)
      );
    });
  }, [search, swots]);

  const aiCount = useMemo(() => swots.filter((item) => item.isAiGenerated).length, [swots]);
  const manualCount = Math.max(0, swots.length - aiCount);

  return (
    <UserLayout>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Analyse SWOT
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Mes SWOT marketing</h1>
              <p className="mt-3 max-w-2xl text-sm text-cyan-100/90 sm:text-base">
                Centralisez vos analyses forces/faiblesses/opportunites/menaces et transformez-les en plan d'action.
              </p>
            </div>
            <Link
              href="/swot/new"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Creer un SWOT
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total SWOT</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{pagination.total}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Generes par IA</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{aiCount}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Manuels</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{manualCount}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par titre ou strategyId..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:bg-white focus:ring-2"
            />
          </label>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={() => void loadSwots(pagination.page || 1)}
              className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-100"
            >
              Reessayer
            </button>
          </section>
        ) : null}

        {isLoading ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </section>
        ) : filteredSwots.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Aucun SWOT trouve</h2>
            <p className="mt-2 text-sm text-slate-600">
              Creez votre premiere analyse ou ajustez votre recherche.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSwots.map((item) => (
              <article
                key={item._id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">Cree le {formatDate(item.createdAt)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.isAiGenerated
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}
                  >
                    {item.isAiGenerated ? 'IA' : 'Manuel'}
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-2 text-xs">
                  <p className="rounded-lg bg-emerald-50 px-2 py-1.5 text-emerald-700">
                    Forces: {item.swot.strengths.length}
                  </p>
                  <p className="rounded-lg bg-rose-50 px-2 py-1.5 text-rose-700">
                    Faiblesses: {item.swot.weaknesses.length}
                  </p>
                  <p className="rounded-lg bg-cyan-50 px-2 py-1.5 text-cyan-700">
                    Opportunites: {item.swot.opportunities.length}
                  </p>
                  <p className="rounded-lg bg-orange-50 px-2 py-1.5 text-orange-700">
                    Menaces: {item.swot.threats.length}
                  </p>
                </div>

                <div className="mb-5 flex items-center gap-2 text-sm text-slate-600">
                  <Target className="h-4 w-4 text-cyan-600" />
                  <span>{getTotalPoints(item.swot)} points strategiques</span>
                </div>

                <Link
                  href={`/swot/${item._id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Ouvrir le SWOT
                </Link>
              </article>
            ))}
          </section>
        )}

        {!isLoading && pagination.pages > 1 ? (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-600">
              Page {pagination.page} sur {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadSwots(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Precedent
              </button>
              <button
                onClick={() => void loadSwots(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </UserLayout>
  );
}
