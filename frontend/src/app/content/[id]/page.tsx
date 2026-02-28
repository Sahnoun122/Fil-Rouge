'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Bot,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useContentCampaign } from '@/src/hooks/useContentCampaigns';

function formatDate(value?: string): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );
}

export default function ContentCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { campaign, isLoading, isSubmitting, error, generateCampaign, regeneratePlatform, regeneratePost } =
    useContentCampaign(campaignId);

  const [generateInstruction, setGenerateInstruction] = useState('');
  const [platformToRegenerate, setPlatformToRegenerate] = useState('');
  const [platformInstruction, setPlatformInstruction] = useState('');
  const [postIndexInput, setPostIndexInput] = useState('0');
  const [postInstruction, setPostInstruction] = useState('');

  const orderedPosts = (campaign?.generatedPosts ?? []).map((post, index) => ({ ...post, index }));

  const handleGenerate = async () => {
    if (!campaignId) return;
    try {
      await generateCampaign(campaignId, {
        instruction: generateInstruction.trim() || undefined,
      });
      toast.success('Contenu genere avec succes');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Erreur de generation');
    }
  };

  const handleRegeneratePlatform = async () => {
    if (!campaignId || !platformToRegenerate) {
      toast.error('Selectionnez une plateforme');
      return;
    }
    try {
      await regeneratePlatform(campaignId, {
        platform: platformToRegenerate,
        instruction: platformInstruction.trim() || undefined,
      });
      toast.success(`Posts ${platformToRegenerate} regeneres`);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Erreur de regeneration plateforme');
    }
  };

  const handleRegeneratePost = async () => {
    if (!campaignId) return;
    const index = Number(postIndexInput);
    if (!Number.isInteger(index) || index < 0) {
      toast.error('Index de post invalide');
      return;
    }

    try {
      await regeneratePost(campaignId, {
        index,
        instruction: postInstruction.trim() || undefined,
      });
      toast.success(`Post #${index} regenere`);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Erreur de regeneration du post');
    }
  };

  if (isLoading && !campaign) {
    return <DetailSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-700">Campagne introuvable</h1>
        <p className="mt-2 text-sm text-rose-600">{error || 'Cette campagne n existe pas ou nest plus accessible.'}</p>
        <Link
          href="/user/content"
          className="mt-4 inline-flex items-center rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/user/content"
            className="inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour aux campagnes
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{campaign.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {campaign.mode} • {campaign.platforms.join(', ') || 'Aucune plateforme'} • {campaign.generatedPosts.length}{' '}
            post{campaign.generatedPosts.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href={`/user/content/new?strategyId=${campaign.strategyId}`}
          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Nouvelle campagne depuis cette strategie
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Frequence</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {campaign.campaignSummary?.postingPlan?.frequencyPerWeek ?? '-'}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Duree (semaines)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {campaign.campaignSummary?.postingPlan?.durationWeeks ?? '-'}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Mise a jour</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(campaign.updatedAt)}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Generation globale</h2>
          <p className="text-sm text-slate-600">
            Lancez la generation de contenus pour toutes les plateformes de la campagne.
          </p>
          <textarea
            value={generateInstruction}
            onChange={(event) => setGenerateInstruction(event.target.value)}
            rows={3}
            placeholder="Instruction optionnelle (ex: accent sur conversion mobile)."
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Generer le contenu
          </button>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Content pillars</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(campaign.campaignSummary?.contentPillars ?? []).length > 0 ? (
                campaign.campaignSummary?.contentPillars?.map((pillar) => (
                  <span
                    key={pillar}
                    className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-800"
                  >
                    {pillar}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">Aucun pillar</span>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              <Target className="h-4 w-4" />
              Astuce
            </p>
            <p className="mt-3 text-sm text-cyan-900">
              Regénérez seulement une plateforme si les autres sont déjà validées.
            </p>
          </article>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Regenerer une plateforme</h2>
          <select
            value={platformToRegenerate}
            onChange={(event) => setPlatformToRegenerate(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">Selectionnez une plateforme</option>
            {campaign.platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <textarea
            value={platformInstruction}
            onChange={(event) => setPlatformInstruction(event.target.value)}
            rows={2}
            placeholder="Instruction optionnelle de regeneration."
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={handleRegeneratePlatform}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerer la plateforme
          </button>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Regenerer un post</h2>
          <input
            type="number"
            min={0}
            value={postIndexInput}
            onChange={(event) => setPostIndexInput(event.target.value)}
            placeholder="Index du post (0,1,2...)"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <textarea
            value={postInstruction}
            onChange={(event) => setPostInstruction(event.target.value)}
            rows={2}
            placeholder="Instruction optionnelle pour ce post."
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={handleRegeneratePost}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerer le post
          </button>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Resultats</h2>
          <span className="text-sm text-slate-600">{orderedPosts.length} posts</span>
        </div>

        {error ? (
          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </article>
        ) : null}

        {orderedPosts.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-400" />
            <h3 className="mt-3 text-lg font-semibold text-slate-900">Aucun post genere</h3>
            <p className="mt-1 text-sm text-slate-600">Lancez une generation globale pour remplir cette campagne.</p>
          </article>
        ) : (
          <div className="space-y-3">
            {orderedPosts.map((post) => (
              <article key={post._id || `${post.platform}-${post.index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                      #{post.index}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {post.platform}
                    </span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-800">
                      {post.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{post.schedule ? `${post.schedule.date} ${post.schedule.time}` : '-'}</p>
                </div>

                {post.hook ? <p className="mt-3 text-sm font-semibold text-slate-900">Hook: {post.hook}</p> : null}
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{post.caption}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(post.hashtags ?? []).map((tag) => (
                    <span key={`${post._id || post.index}-${tag}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>

                {post.cta ? <p className="mt-3 text-sm font-medium text-slate-800">CTA: {post.cta}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
