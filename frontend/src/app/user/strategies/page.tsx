'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Eye,
  MoreHorizontal,
  Trash2,
  Calendar,
  Building,
  Users,
  Target,
  DollarSign,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useStrategiesList } from '../../../hooks/useStrategies';
import { Strategy, OBJECTIVE_LABELS, TONE_LABELS } from '../../../types/strategy.types';
import strategiesService from '../../../services/strategiesService';
import { generateStrategyPdf } from '../../../lib/strategyPdf';

const EmptyState = () => (
  <div className="py-16 text-center">
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-12 shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune stratégie encore</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        Commencez en créant votre première stratégie marketing personnalisée par IA.
      </p>
      <Link
        href="/user/strategies/new"
        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" />
        Créer ma première stratégie
      </Link>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2.5 mb-5">
          <div className="h-3 bg-slate-100 rounded" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </div>
        <div className="h-9 bg-slate-200 rounded-xl" />
      </div>
    ))}
  </div>
);

interface StrategyCardProps {
  strategy: Strategy;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  isDeleting?: boolean;
  isDownloading?: boolean;
}

const StrategyCard = ({
  strategy,
  onDelete,
  onDownload,
  isDeleting = false,
  isDownloading = false,
}: StrategyCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleView = () => {
    router.push(`/user/strategies/${strategy._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette stratégie ?')) {
      try {
        await onDelete(strategy._id);
        toast.success('Stratégie supprimée');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
    setShowMenu(false);
  };

  const handleDownload = () => {
    onDownload(strategy._id);
    setShowMenu(false);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Top accent on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-violet-500 to-purple-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-purple-600 shadow-sm shadow-violet-500/20">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900 leading-tight">
              {strategy.businessInfo.businessName}
            </h3>
            <p className="truncate text-xs text-slate-500 mt-0.5">{strategy.businessInfo.industry}</p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            disabled={isDeleting}
            type="button"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1.5 z-20 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-200/80">
                <button
                  onClick={handleView}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  type="button"
                >
                  <Eye className="h-4 w-4 text-slate-400" />
                  Voir les détails
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                >
                  <Download className="h-4 w-4 text-slate-400" />
                  {isDownloading ? 'Génération PDF...' : 'Télécharger PDF'}
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{strategy.businessInfo.targetAudience}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Target className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{OBJECTIVE_LABELS[strategy.businessInfo.mainObjective]}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{formatBudget(strategy.businessInfo.budget)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Créé le {formatDate(strategy.createdAt)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
          {TONE_LABELS[strategy.businessInfo.tone]}
        </span>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {strategy.businessInfo.location}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleView}
          className="w-full rounded-xl bg-linear-to-br from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 active:scale-[0.98]"
          type="button"
        >
          Voir la stratégie complète
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 active:scale-[0.98]"
          type="button"
        >
          {isDownloading ? 'Génération PDF...' : 'Télécharger PDF'}
        </button>
      </div>
    </div>
  );
};



export default function StrategiesPage() {
  const {
    strategies,
    pagination,
    isLoading,
    error,
    deleteStrategy,
    changePage,
    refresh,
  } = useStrategiesList();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterBy, setFilterBy] = useState<'all' | string>('all');
  const [downloadingStrategyId, setDownloadingStrategyId] = useState<string | null>(null);

  const filteredStrategies = strategies
    .filter((strategy) => {
      const matchesSearch =
        strategy.businessInfo.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.businessInfo.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || strategy.businessInfo.mainObjective === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) =>
      sortBy === 'date'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : a.businessInfo.businessName.localeCompare(b.businessInfo.businessName),
    );

  const handleDeleteStrategy = async (id: string) => {
    await deleteStrategy(id);
  };

  const handleDownloadStrategy = async (id: string) => {
    setDownloadingStrategyId(id);
    try {
      const payload = await strategiesService.getStrategyPdfPayload(id);
      generateStrategyPdf(payload);
      toast.success('PDF généré avec succès');
    } catch {
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingStrategyId(null);
    }
  };

  if (isLoading && strategies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-7 w-48 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 shadow-sm shadow-violet-500/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mes stratégies marketing</h1>
            <p className="text-sm text-slate-500">
              {strategies.length > 0
                ? `${pagination.total} stratégie${pagination.total > 1 ? 's' : ''} trouvée${pagination.total > 1 ? 's' : ''}`
                : 'Gérez vos stratégies marketing générées par IA'}
            </p>
          </div>
        </div>
        <Link
          href="/user/strategies/new"
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Nouvelle stratégie
        </Link>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={refresh} className="text-xs font-semibold text-red-700 underline hover:text-red-900">
            Réessayer
          </button>
        </div>
      )}

      {/* Filters */}
      {strategies.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher par nom ou secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 sm:w-48"
            >
              <option value="all">Tous les objectifs</option>
              {Object.entries(OBJECTIVE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 sm:w-44"
            >
              <option value="date">Plus récent</option>
              <option value="name">Par nom</option>
            </select>
          </div>
        </section>
      )}

      {/* Content */}
      {filteredStrategies.length === 0 && strategies.length === 0 ? (
        <EmptyState />
      ) : filteredStrategies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-sm">
          <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Aucune stratégie ne correspond à votre recherche.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy._id}
                strategy={strategy}
                onDelete={handleDeleteStrategy}
                onDownload={handleDownloadStrategy}
                isDeleting={isLoading}
                isDownloading={downloadingStrategyId === strategy._id}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Affichage {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 1)
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-1 text-slate-400 text-xs">…</span>
                      )}
                      <button
                        onClick={() => changePage(page)}
                        className={`min-w-8.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          page === pagination.page
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
