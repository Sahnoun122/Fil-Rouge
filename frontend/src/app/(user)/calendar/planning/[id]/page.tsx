'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  LayoutTemplate,
  Loader2,
  Sparkles,
  Tags,
  TextQuote,
} from 'lucide-react';
import { calendarService } from '@/src/services/calendarService';
import { contentService } from '@/src/services/contentService';
import type { ScheduledPost } from '@/src/types/calendar.types';
import type { ContentCampaign, GeneratedPost } from '@/src/types/content.types';

function extractGeneratedPostIndex(notes?: string | null): number | null {
  if (!notes) {
    return null;
  }

  const match = /^AUTO_SCHEDULE:[^:]+:(\d+)$/.exec(notes.trim());
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(status: ScheduledPost['status']) {
  if (status === 'published') return 'Publie';
  if (status === 'late') return 'En retard';
  return 'Planifie';
}

function matchGeneratedPost(
  campaign: ContentCampaign | null,
  post: ScheduledPost | null,
): GeneratedPost | null {
  if (!campaign || !post) {
    return null;
  }

  const indexedMatch = extractGeneratedPostIndex(post.notes);
  if (
    indexedMatch !== null &&
    indexedMatch >= 0 &&
    indexedMatch < campaign.generatedPosts.length
  ) {
    return campaign.generatedPosts[indexedMatch] ?? null;
  }

  return (
    campaign.generatedPosts.find(
      (generatedPost) =>
        generatedPost.caption.trim() === post.caption.trim() &&
        generatedPost.platform.toLowerCase() === post.platform.toLowerCase(),
    ) ?? null
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-32 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-28 animate-pulse rounded-[24px] border border-stone-200 bg-stone-100" />
        <div className="h-28 animate-pulse rounded-[24px] border border-stone-200 bg-stone-100" />
        <div className="h-28 animate-pulse rounded-[24px] border border-stone-200 bg-stone-100" />
      </div>
      <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
    </div>
  );
}

export default function PlanningDetailPage() {
  const params = useParams<{ id: string }>();
  const planningId = params.id;
  const [scheduledPost, setScheduledPost] = useState<ScheduledPost | null>(null);
  const [campaign, setCampaign] = useState<ContentCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!planningId) {
      return;
    }

    const loadPlanning = async () => {
      setIsLoading(true);
      try {
        const post = await calendarService.getPost(planningId);
        setScheduledPost(post);

        if (post.campaignId) {
          const linkedCampaign = await contentService.getCampaign(post.campaignId);
          setCampaign(linkedCampaign);
        } else {
          setCampaign(null);
        }
      } catch (requestError) {
        toast.error(
          requestError instanceof Error
            ? requestError.message
            : 'Erreur lors du chargement du planning',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlanning();
  }, [planningId]);

  const generatedPost = useMemo(
    () => matchGeneratedPost(campaign, scheduledPost),
    [campaign, scheduledPost],
  );

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!scheduledPost) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-700">Planning introuvable</h1>
        <p className="mt-2 text-sm text-rose-600">
          Cette publication planifiee n est plus accessible.
        </p>
        <Link
          href="/calendar"
          className="mt-4 inline-flex items-center rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour calendrier
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '18px',
            border: '1px solid #e7e5e4',
            background: '#fffaf4',
            color: '#1c1917',
          },
        }}
      />

      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(245,247,250,0.98)_38%,_rgba(229,231,235,0.92)_100%)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <Link
              href={scheduledPost.campaignId ? `/calendar?campaignId=${scheduledPost.campaignId}` : '/calendar'}
              className="inline-flex items-center text-sm font-medium text-stone-600 transition hover:text-stone-950"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Retour au planning
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Planning detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              {generatedPost?.title || scheduledPost.title || 'Publication planifiee'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Vue detaillee du planning avec les donnees de publication et le contenu genere par l IA.
            </p>
          </div>

          <div className="rounded-[24px] border border-cyan-200 bg-cyan-50/80 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Campagne
            </p>
            <p className="mt-2 text-base font-semibold text-stone-950">
              {campaign?.name || 'Campagne non liee'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            <CalendarClock className="h-3.5 w-3.5" />
            Planification
          </p>
          <p className="mt-3 text-lg font-semibold text-stone-950">
            {formatDateTime(scheduledPost.scheduledAt)}
          </p>
        </article>
        <article className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            <Globe2 className="h-3.5 w-3.5" />
            Plateforme
          </p>
          <p className="mt-3 text-lg font-semibold text-stone-950">
            {scheduledPost.platform}
          </p>
        </article>
        <article className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Type
          </p>
          <p className="mt-3 text-lg font-semibold text-stone-950">
            {scheduledPost.postType}
          </p>
        </article>
        <article className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Statut
          </p>
          <p className="mt-3 text-lg font-semibold text-stone-950">
            {formatStatus(scheduledPost.status)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="space-y-5 rounded-[30px] border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              Contenu genere par l'IA
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {generatedPost?.title || scheduledPost.title || 'Sans titre'}
            </h2>
          </div>

          {generatedPost?.hook ? (
            <div className="rounded-[22px] border border-cyan-200 bg-cyan-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Hook
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-cyan-950">
                {generatedPost.hook}
              </p>
            </div>
          ) : null}

          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              <TextQuote className="h-3.5 w-3.5" />
              Caption
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">
              {generatedPost?.caption || scheduledPost.caption}
            </p>
          </div>

          {generatedPost?.description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                Description
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {generatedPost.description}
              </p>
            </div>
          ) : null}

          {generatedPost?.cta ? (
            <div className="rounded-[20px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                CTA
              </p>
              <p className="mt-2 text-sm font-medium text-stone-800">
                {generatedPost.cta}
              </p>
            </div>
          ) : null}
        </article>

        <aside className="space-y-5">
          <article className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              <Clock3 className="h-3.5 w-3.5" />
              Informations de planning
            </p>
            <dl className="mt-4 space-y-4 text-sm text-stone-700">
              <div className="flex items-start justify-between gap-4">
                <dt>Date</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {formatDateTime(scheduledPost.scheduledAt)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Timezone</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {scheduledPost.timezone}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Platforme</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {scheduledPost.platform}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Type</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {scheduledPost.postType}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Statut</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {formatStatus(scheduledPost.status)}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              <Tags className="h-3.5 w-3.5" />
              Hashtags
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(generatedPost?.hashtags || scheduledPost.hashtags || []).length > 0 ? (
                (generatedPost?.hashtags || scheduledPost.hashtags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">Aucun hashtag</span>
              )}
            </div>
          </article>

          {scheduledPost.notes ? (
            <article className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                <FileText className="h-3.5 w-3.5" />
                Notes techniques
              </p>
              <p className="mt-4 break-all text-sm leading-6 text-stone-600">
                {scheduledPost.notes}
              </p>
            </article>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
