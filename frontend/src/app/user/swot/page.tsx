'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Eye, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetcher } from '@/src/utils/fetcher';

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

interface SwotListPayload {
  swots: SwotItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface StrategyLinked {
  _id: string;
  businessInfo: {
    businessName: string;
  };
}

const PAGE = 1;
const LIMIT = 10;

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

function SwotTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-5 gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
      <div className="space-y-3 px-6 py-4">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((__, col) => (
              <div key={col} className="h-9 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserSwotListPage() {
  const searchParams = useSearchParams();
  const strategyFilter = (searchParams.get('strategyId') || '').trim();

  const [swots, setSwots] = useState<SwotItem[]>([]);
  const [strategyNames, setStrategyNames] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SwotItem | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadStrategyNames = useCallback(async (items: SwotItem[]) => {
    const ids = Array.from(new Set(items.map((item) => item.strategyId).filter(Boolean)));

    if (ids.length === 0) {
      setStrategyNames({});
      return;
    }

    const pairs = await Promise.all(
      ids.map(async (id) => {
        try {
          const response = await fetcher<StrategyLinked>(`/strategies/${id}`, {
            method: 'GET',
            requireAuth: true,
          });
          const businessName = response.data?.businessInfo?.businessName;
          return [id, businessName || id] as const;
        } catch {
          return [id, id] as const;
        }
      }),
    );

    setStrategyNames(Object.fromEntries(pairs));
  }, []);

  const loadSwots = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetcher<SwotListPayload>(`/swot?page=${PAGE}&limit=${LIMIT}`, {
        method: 'GET',
        requireAuth: true,
      });

      const payload = response.data;
      if (!payload) {
        throw new Error('Invalid SWOT response');
      }

      const items = payload.swots ?? [];
      setSwots(items);
      await loadStrategyNames(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading SWOT analyses');
    } finally {
      setIsLoading(false);
    }
  }, [loadStrategyNames]);

  useEffect(() => {
    void loadSwots();
  }, [loadSwots]);

  const filteredAndSortedSwots = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return [...swots]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((item) => {
        if (strategyFilter && item.strategyId !== strategyFilter) {
          return false;
        }

        if (!normalized) return true;

        const strategyLabel = strategyNames[item.strategyId] || item.strategyId;

        return (
          item.title.toLowerCase().includes(normalized) ||
          strategyLabel.toLowerCase().includes(normalized) ||
          item.strategyId.toLowerCase().includes(normalized)
        );
      });
  }, [search, strategyFilter, strategyNames, swots]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await fetcher(`/swot/${deleteTarget._id}`, {
        method: 'DELETE',
        requireAuth: true,
      });

      setSwots((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success('SWOT deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting SWOT');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">SWOT Analytics</p>
            <h1 className="text-3xl font-bold">Mes analyses SWOT</h1>
            <p className="mt-2 text-sm text-slate-200">
              Consultez, recherchez et gérez toutes vos analyses SWOT en un seul endroit.
            </p>
          </div>
          <Link
            href="/user/swot/new"
            className="inline-flex items-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle analyse
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par titre ou stratégie..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:bg-white focus:ring-2"
          />
        </label>
        {strategyFilter ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200">
              Filtre stratégie : {strategyNames[strategyFilter] || strategyFilter}
            </span>
            <Link
              href="/swot"
              className="inline-flex rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Supprimer le filtre
            </Link>
          </div>
        ) : null}
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p>{error}</p>
          <button
            onClick={() => void loadSwots()}
            className="mt-3 rounded-lg border border-rose-300 px-3 py-1.5 font-medium text-rose-700 transition hover:bg-rose-100"
          >
            Retry
          </button>
        </section>
      ) : null}

      {isLoading ? (
        <SwotTableSkeleton />
      ) : filteredAndSortedSwots.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-slate-700 shadow-md">
            <Search className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Aucune analyse trouvée</h2>
          <p className="mt-2 text-sm text-slate-500">
            Commencez par créer votre première analyse SWOT.
          </p>
          <Link
            href="/user/swot/new"
            className="mt-6 inline-flex items-center rounded-xl bg-linear-to-br from-cyan-500 to-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle analyse
          </Link>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Titre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Stratégie liée
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Généré par IA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Créé le
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSwots.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <Link href={`/strategies/${item.strategyId}`} className="hover:text-cyan-700 hover:underline">
                        {strategyNames[item.strategyId] || item.strategyId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.isAiGenerated
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}
                      >
                        {item.isAiGenerated ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/user/swot/${item._id}`}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Voir
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="text-sm text-slate-600">
              Voulez-vous supprimer l’analyse <span className="font-semibold text-slate-900">{deleteTarget.title}</span>?
              Cette action est irréversible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
