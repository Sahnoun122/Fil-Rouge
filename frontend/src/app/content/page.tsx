'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useContentCampaignsList } from '@/src/hooks/useContentCampaigns';
import { ContentCampaign, ContentMode } from '@/src/types/content.types';
import { Layers, Plus, Search, Trash2, WandSparkles } from 'lucide-react';

const modeLabel: Record<ContentMode, string> = {
  ADS: 'Ads',
  CONTENT_MARKETING: 'Content marketing',
};

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
          className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
            {modeLabel[campaign.mode]}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{campaign.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {campaign.platforms.length} plateforme{campaign.platforms.length > 1 ? 's' : ''} •{' '}
            {campaign.generatedPosts.length} post{campaign.generatedPosts.length > 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(campaign._id)}
          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
          aria-label="Supprimer la campagne"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {campaign.platforms.slice(0, 4).map((platform) => (
          <span
            key={platform}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {platform}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-500">Maj: {formatDate(campaign.updatedAt)}</span>
        <Link
          href={`/content/${campaign._id}`}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Ouvrir
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
    if (!window.confirm('Supprimer cette campagne content ?')) return;
    await deleteCampaign(campaignId);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content</h1>
          <p className="mt-2 text-sm text-slate-600">
            Gerez vos campagnes de generation de contenu IA.
          </p>
        </div>

        <Link
          href="/content/new"
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle campagne
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Campagnes</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pagination.total}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Posts generes</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalPosts}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Plateformes actives</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {new Set(campaigns.flatMap((campaign) => campaign.platforms)).size}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une campagne..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value as 'all' | ContentMode)}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">Tous les modes</option>
            <option value="ADS">Ads</option>
            <option value="CONTENT_MARKETING">Content marketing</option>
          </select>

          <button
            type="button"
            onClick={() => loadCampaigns(pagination.page, pagination.limit)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <WandSparkles className="mr-2 h-4 w-4" />
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
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Aucune campagne trouvee</h2>
          <p className="mt-2 text-sm text-slate-600">
            Creez votre premiere campagne Content ou modifiez vos filtres.
          </p>
          <Link
            href="/content/new"
            className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Creer une campagne
          </Link>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} onDelete={handleDelete} />
            ))}
          </section>

          <section className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-3">Campagne</th>
                  <th className="px-5 py-3">Mode</th>
                  <th className="px-5 py-3">Plateformes</th>
                  <th className="px-5 py-3">Posts</th>
                  <th className="px-5 py-3">Maj</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{campaign.name}</p>
                      <p className="text-xs text-slate-500">{campaign.objective}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{modeLabel[campaign.mode]}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {campaign.platforms.map((platform) => (
                          <span
                            key={`${campaign._id}-${platform}`}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{campaign.generatedPosts.length}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(campaign.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/content/${campaign._id}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Voir
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(campaign._id)}
                          disabled={isSubmitting}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          Supprimer
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

      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Page {pagination.page} sur {Math.max(1, pagination.pages)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadCampaigns(Math.max(1, pagination.page - 1), pagination.limit)}
            disabled={pagination.page <= 1 || isLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Precedent
          </button>
          <button
            type="button"
            onClick={() => loadCampaigns(Math.min(pagination.pages, pagination.page + 1), pagination.limit)}
            disabled={pagination.page >= pagination.pages || pagination.pages === 0 || isLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </section>
    </div>
  );
}
