'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Layers3,
  Megaphone,
  User,
} from 'lucide-react';
import { useAdminContent } from '@/src/hooks/useAdmin';
import type { GeneratedPost } from '@/src/types/content.types';

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

const formatMode = (value: string): string => {
  return value === 'ADS' ? 'Ads' : 'Content marketing';
};

const formatObjective = (value: string): string => {
  const labels: Record<string, string> = {
    leads: 'Leads',
    sales: 'Ventes',
    awareness: 'Notoriete',
    engagement: 'Engagement',
  };

  return labels[value] || value;
};

type DetailItem = {
  label: string;
  value: string;
};

function DetailGrid({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

function PostCard({ index, post }: { index: number; post: GeneratedPost }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header
        className="cursor-pointer border-b border-slate-100 p-5 transition hover:bg-slate-50"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Post {index + 1} - {post.platform}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{post.type || 'post'}</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </header>

      {isExpanded ? (
        <div className="space-y-4 p-5">
          {post.title ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Titre</p>
              <p className="mt-1 text-sm text-slate-900">{post.title}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Caption</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{post.caption}</p>
          </div>

          {post.description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.description}</p>
            </div>
          ) : null}

          {post.hook ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hook</p>
              <p className="mt-1 text-sm text-slate-900">{post.hook}</p>
            </div>
          ) : null}

          {post.cta ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CTA</p>
              <p className="mt-1 text-sm text-slate-900">{post.cta}</p>
            </div>
          ) : null}

          {post.hashtags && post.hashtags.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hashtags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {post.suggestedVisual ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visuel suggere</p>
              <p className="mt-1 text-sm text-slate-900">{post.suggestedVisual}</p>
            </div>
          ) : null}

          {post.adCopyVariantA || post.adCopyVariantB || post.adCopyVariantC ? (
            <div className="grid gap-3 md:grid-cols-3">
              {[post.adCopyVariantA, post.adCopyVariantB, post.adCopyVariantC].map((variant, variantIndex) =>
                variant ? (
                  <article key={`${post.platform}-variant-${variantIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Variante {String.fromCharCode(65 + variantIndex)}
                    </p>
                    <p className="mt-2 text-sm text-slate-900">{variant}</p>
                  </article>
                ) : null,
              )}
            </div>
          ) : null}

          {post.schedule ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Programmation</p>
              <p className="mt-1 text-sm text-slate-900">
                {post.schedule.date} a {post.schedule.time}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function AdminContentDetailPage() {
  const params = useParams();
  const contentId = params.id as string;
  const { content, error, isLoadingContent, loadContent } = useAdminContent();

  useEffect(() => {
    if (!contentId) {
      return;
    }

    loadContent(contentId).catch(() => undefined);
  }, [contentId, loadContent]);

  const summaryCards = useMemo(() => {
    if (!content) {
      return [];
    }

    return [
      { label: 'Mode', value: formatMode(content.mode) },
      { label: 'Objectif', value: formatObjective(content.objective) },
      { label: 'Posts generes', value: String(content.generatedPosts.length) },
      {
        label: 'Frequence / semaine',
        value: content.campaignSummary?.postingPlan?.frequencyPerWeek
          ? String(content.campaignSummary.postingPlan.frequencyPerWeek)
          : '-',
      },
    ];
  }, [content]);

  if (isLoadingContent) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Chargement de la campagne content...
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Campagne introuvable</h2>
          <p className="mb-6 text-slate-600">{error || 'Cette campagne est indisponible.'}</p>
          <Link
            href="/admin/content"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au contenu
          </Link>
        </div>
      </div>
    );
  }

  const infoItems: DetailItem[] = [
    { label: 'Nom de campagne', value: content.name },
    { label: 'Entreprise', value: content.user.companyName || '-' },
    { label: 'Business source', value: content.strategy.businessName || '-' },
    { label: 'Secteur', value: content.strategy.industry || '-' },
    {
      label: 'Plateformes',
      value: content.platforms.length > 0 ? content.platforms.join(', ') : '-',
    },
    { label: 'Cree le', value: formatDate(content.createdAt) },
  ];

  const inputItems: DetailItem[] = [
    { label: 'Offre produit', value: content.inputs?.productOffer || '-' },
    { label: 'Audience cible', value: content.inputs?.targetAudience || '-' },
    { label: 'Ton', value: content.inputs?.tone || '-' },
    { label: 'Call to action', value: content.inputs?.callToAction || '-' },
    { label: 'Promo details', value: content.inputs?.promoDetails || '-' },
    { label: 'Budget', value: content.inputs?.budget ? String(content.inputs.budget) : '-' },
    {
      label: 'Content pillars',
      value:
        content.inputs?.contentPillars && content.inputs.contentPillars.length > 0
          ? content.inputs.contentPillars.join(', ')
          : '-',
    },
    {
      label: 'Periode',
      value:
        content.inputs?.startDate || content.inputs?.endDate
          ? `${formatDate(content.inputs?.startDate)} -> ${formatDate(content.inputs?.endDate)}`
          : '-',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
          <Link href="/admin/content" className="transition-colors hover:text-slate-700">
            Content admin
          </Link>
          <span>-</span>
          <span className="max-w-64 truncate font-medium text-slate-900">{content.name}</span>
        </nav>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
                  <Megaphone className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">{content.name}</h1>
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {formatMode(content.mode)}
                    </span>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {formatObjective(content.objective)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {content.user.fullName} ({content.user.email})
                    </p>
                    <p className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      {content.strategy.businessName}
                    </p>
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Cree le {formatDate(content.createdAt)}
                    </p>
                    <p className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Mise a jour le {formatDate(content.updatedAt)}
                    </p>
                    <p className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      {content.platforms.length > 0 ? content.platforms.join(', ') : 'Aucune plateforme'}
                    </p>
                    <p className="flex items-center">
                      <Layers3 className="mr-2 h-4 w-4" />
                      {content.generatedPosts.length} posts generes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/admin/content"
              className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour a la liste
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Informations generales</h2>
            </div>
            <DetailGrid items={infoItems} />
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Parametres de campagne</h2>
            </div>
            <DetailGrid items={inputItems} />
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Synthese IA</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Content pillars</p>
              <p className="mt-2 text-sm text-slate-900">
                {content.campaignSummary?.contentPillars?.length
                  ? content.campaignSummary.contentPillars.join(', ')
                  : '-'}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Posting plan</p>
              <p className="mt-2 text-sm text-slate-900">
                {content.campaignSummary?.postingPlan?.frequencyPerWeek
                  ? `${content.campaignSummary.postingPlan.frequencyPerWeek} posts/semaine`
                  : '-'}
                {content.campaignSummary?.postingPlan?.durationWeeks
                  ? ` sur ${content.campaignSummary.postingPlan.durationWeeks} semaines`
                  : ''}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Posts generes</h2>
          </div>

          {content.generatedPosts.length > 0 ? (
            content.generatedPosts.map((post, index) => (
              <PostCard key={post._id || `${post.platform}-${index}`} index={index} post={post} />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
              Aucun post genere pour cette campagne.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
