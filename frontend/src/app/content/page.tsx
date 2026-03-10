'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useContentCampaignsList } from '@/src/hooks/useContentCampaigns';
import { ContentCampaign, ContentMode } from '@/src/types/content.types';
import { BarChart3, Layers, Megaphone, Plus, RefreshCw, Search, Share2, Trash2 } from 'lucide-react';

const modeLabel: Record<ContentMode, string> = {
  ADS: 'Ads',
  CONTENT_MARKETING: 'Content marketing',
};

const modeBadgeClass: Record<ContentMode, string> = {
  ADS: 'bg-purple-100 text-purple-700',
  CONTENT_MARKETING: 'bg-cyan-100 text-cyan-700',
};

const platformColorMap: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  tiktok: 'bg-slate-900 text-white',
  facebook: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-blue-50 text-blue-800',
  youtube: 'bg-red-100 text-red-700',
  pinterest: 'bg-red-50 text-red-600',
  x: 'bg-slate-800 text-white',
  snapchat: 'bg-yellow-100 text-yellow-700',
  threads: 'bg-slate-100 text-slate-700',
};

function getPlatformClass(platform: string) {
  return platformColorMap[platform.toLowerCase()] ?? 'bg-slate-100 text-slate-700';
}

function formatDate(value?: string): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-linear-to-r from-slate-100 to-slate-50"
        />
      ))}
    </div>
  );
}

function CampaignCard({
  campaign,
  onDelete,
}: {
  campaign: ContentCampaign;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${modeBadgeClass[campaign.mode]}`}>
            {modeLabel[campaign.mode]}
          </span>
          <h3 className="mt-2 truncate text-base font-bold text-slate-900">{campaign.name}</h3>
          {campaign.objective && (
            <p className="mt-0.5 truncate text-xs text-slate-400">{campaign.objective}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(campaign._id)}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
          aria-label="Delete campaign"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {campaign.platforms.slice(0, 4).map((platform) => (
          <span
            key={platform}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getPlatformClass(platform)}`}
          >
            {platform}
          </span>
        ))}
        {campaign.platforms.length > 4 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            +{campaign.platforms.length - 4}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            <span className="font-semibold text-slate-700">{campaign.generatedPosts.length}</span> posts
          </span>
          <span className="text-slate-200">|</span>
          <span>Mis à jour le {formatDate(campaign.updatedAt)}</span>
        </div>
        <Link
          href={`/user/content/${campaign._id}`}
          className="rounded-xl bg-linear-to-r from-violet-600 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:from-violet-700 hover:to-purple-700 active:scale-95"
        >
          Ouvrir →
        </Link>
      </div>
    </article>
  );
}

export default function ContentCampaignsPage() {
  const { campaigns, pagination, isLoading, isSubmitting, error, loadCampaigns, deleteCampaign } =
    useContentCampaignsList(1, 10);

  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | ContentMode>('all');

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesMode = modeFilter === 'all' || campaign.mode === modeFilter;
      const matchesQuery =
        !normalizedQuery ||
        campaign.name.toLowerCase().includes(normalizedQuery) ||
        campaign.platforms.some((platform) => platform.toLowerCase().includes(normalizedQuery));

      return matchesMode && matchesQuery;
    });
  }, [campaigns, modeFilter, query]);

  const totalPosts = useMemo(
    () => campaigns.reduce((total, campaign) => total + campaign.generatedPosts.length, 0),
    [campaigns],
  );

  const handleDelete = async (campaignId: string) => {
    if (!window.confirm('Supprimer cette campagne de contenu ?')) return;
    await deleteCampaign(campaignId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/20">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Content</h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Gérez vos campagnes de génération de contenu par IA.
          </p>
        </div>
        <Link
          href="/user/content/new"
          className="inline-flex items-center rounded-xl bg-linear-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle campagne
        </Link>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50">
            <Layers className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Campagnes</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">{pagination.total}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Posts générés</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">{totalPosts}</p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
            <Share2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Plateformes</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">
              {new Set(campaigns.flatMap((campaign) => campaign.platforms)).size}
            </p>
          </div>
        </article>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une campagne..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
            />
          </label>
          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value as 'all' | ContentMode)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">Tous les modes</option>
            <option value="ADS">Ads</option>
            <option value="CONTENT_MARKETING">Content marketing</option>
          </select>
          <button
            type="button"
            onClick={() => loadCampaigns(pagination.page, pagination.limit)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </button>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      {isLoading && campaigns.length === 0 ? (
        <ListSkeleton />
      ) : filteredCampaigns.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200">
            <Layers className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Aucune campagne trouvée</h2>
          <p className="mt-2 text-sm text-slate-500">
            Créez votre première campagne de contenu ou ajustez vos filtres.
          </p>
          <Link
            href="/user/content/new"
            className="mt-6 inline-flex items-center rounded-xl bg-linear-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer une campagne
          </Link>
        </section>
      ) : (
        <>
          {/* Mobile cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} onDelete={handleDelete} />
            ))}
          </section>

          {/* Desktop table */}
          <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full min-w-230">
              <thead>
                <tr className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Campagne</th>
                  <th className="px-5 py-4">Mode</th>
                  <th className="px-5 py-4">Plateformes</th>
                  <th className="px-5 py-4">Posts</th>
                  <th className="px-5 py-4">Mis à jour</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{campaign.name}</p>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{campaign.objective}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${modeBadgeClass[campaign.mode]}`}>
                        {modeLabel[campaign.mode]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {campaign.platforms.slice(0, 3).map((platform) => (
                          <span
                            key={`${campaign._id}-${platform}`}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getPlatformClass(platform)}`}
                          >
                            {platform}
                          </span>
                        ))}
                        {campaign.platforms.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            +{campaign.platforms.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700">
                        {campaign.generatedPosts.length}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(campaign.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/user/content/${campaign._id}`}
                          className="rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:from-violet-700 hover:to-purple-700"
                        >
                          Ouvrir
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(campaign._id)}
                          disabled={isSubmitting}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* Pagination */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Page{' '}
          <span className="font-semibold text-slate-700">{pagination.page}</span>
          {' '}sur{' '}
          <span className="font-semibold text-slate-700">{Math.max(1, pagination.pages)}</span>
          {' '}— {pagination.total} campagne{pagination.total > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadCampaigns(Math.max(1, pagination.page - 1), pagination.limit)}
            disabled={pagination.page <= 1 || isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            ← Précédent
          </button>
          <button
            type="button"
            onClick={() => loadCampaigns(Math.min(pagination.pages, pagination.page + 1), pagination.limit)}
            disabled={pagination.page >= pagination.pages || pagination.pages === 0 || isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      </section>
    </div>
  );
}
