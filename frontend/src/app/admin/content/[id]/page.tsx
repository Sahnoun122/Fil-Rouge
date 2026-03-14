'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Layers3,
  Megaphone,
  User,
  Target,
  RefreshCw
} from 'lucide-react';
import { useAdminContent } from '@/src/hooks/useAdmin';
import type { GeneratedPost } from '@/src/types/content.types';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return DATE_FORMATTER.format(date);
};

const formatMode = (value: string): string => {
  return value === 'ADS' ? 'Publicités (Ads)' : 'Contenu Marketing';
};

const formatObjective = (value: string): string => {
  const labels: Record<string, string> = {
    leads: 'Acquisition',
    sales: 'Ventes',
    awareness: 'Notoriété',
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
        <article key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-indigo-50/30 hover:border-indigo-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{item.label}</p>
          <p className="text-sm font-semibold text-slate-800 break-words">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

function PostCard({ index, post }: { index: number; post: GeneratedPost }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
      <header
        className="group flex cursor-pointer items-center justify-between bg-white border-b border-slate-100 p-5 transition-colors hover:bg-slate-50/80"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-4">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-black">
             {index + 1}
           </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
              {post.platform} <span className="text-slate-400 font-medium ml-1">· {post.type || 'post'}</span>
            </h3>
            {post.schedule && (
              <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Prévu le {post.schedule.date} à {post.schedule.time}
              </p>
            )}
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </header>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-6 bg-slate-50/30 space-y-5">
            {post.title && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Titre</p>
                <p className="text-sm font-semibold text-slate-900">{post.title}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Caption / Corps du texte</p>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                 <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.caption}</p>
              </div>
            </div>

            {post.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{post.description}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
               {post.hook && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Accroche (Hook)</p>
                  <p className="text-sm font-medium text-slate-800">{post.hook}</p>
                </div>
               )}
               {post.cta && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Appel à l'action (CTA)</p>
                  <p className="text-sm font-medium text-slate-800">{post.cta}</p>
                </div>
               )}
            </div>

            {post.hashtags && post.hashtags.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.hashtags.map((tag) => (
                    <span key={tag} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.suggestedVisual && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Visuel suggéré</p>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-3">
                   <p className="text-sm font-medium text-slate-700">{post.suggestedVisual}</p>
                </div>
              </div>
            )}

            {(post.adCopyVariantA || post.adCopyVariantB || post.adCopyVariantC) && (
              <div className="space-y-3 pt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 pt-5">Variantes de texte (A/B Testing)</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { title: 'Variante A', content: post.adCopyVariantA, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { title: 'Variante B', content: post.adCopyVariantB, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                    { title: 'Variante C', content: post.adCopyVariantC, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
                  ].map((variant, idx) =>
                    variant.content ? (
                      <article key={idx} className={`rounded-xl border ${variant.border} ${variant.bg} p-4 shadow-sm`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${variant.color}`}>
                          {variant.title}
                        </p>
                        <p className="text-sm text-slate-800 font-medium">{variant.content}</p>
                      </article>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminContentDetailPage() {
  const params = useParams();
  const contentId = params.id as string;
  const { content, error, isLoadingContent, loadContent } = useAdminContent();

  useEffect(() => {
    if (!contentId) return;
    loadContent(contentId).catch(() => undefined);
  }, [contentId, loadContent]);

  const summaryCards = useMemo(() => {
    if (!content) return [];
    return [
      { label: 'Mode', value: formatMode(content.mode) },
      { label: 'Objectif', value: formatObjective(content.objective) },
      { label: 'Posts générés', value: String(content.generatedPosts.length) },
      {
        label: 'Fréquence de diff.',
        value: content.campaignSummary?.postingPlan?.frequencyPerWeek
          ? `${content.campaignSummary.postingPlan.frequencyPerWeek} / sem.`
          : '-',
      },
    ];
  }, [content]);

  const handleRefresh = async () => {
    if (!contentId) return;
    await loadContent(contentId);
  };

  if (isLoadingContent) {
     return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4" />
            <p className="text-sm font-medium text-slate-500">Chargement de la campagne...</p>
          </div>
        </div>
     );
  }

  if (error || !content) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Campagne introuvable</h2>
          <p className="mb-8 text-sm text-slate-600">
            {error || 'Cette campagne est indisponible ou a été supprimée.'}
          </p>
          <Link
            href="/admin/content"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const infoItems: DetailItem[] = [
    { label: 'Nom de la campagne', value: content.name },
    { label: 'Entreprise Cliente', value: content.user.companyName || '-' },
    { label: 'Business Associé', value: content.strategy.businessName || '-' },
    { label: 'Secteur d\'activité', value: content.strategy.industry || '-' },
    { label: 'Plateformes ciblées', value: content.platforms.length > 0 ? content.platforms.join(', ') : '-' },
    { label: 'Créée le', value: formatDate(content.createdAt) },
  ];

  const inputItems: DetailItem[] = [
    { label: 'Offre / Produit', value: content.inputs?.productOffer || '-' },
    { label: 'Cible d\'audience', value: content.inputs?.targetAudience || '-' },
    { label: 'Ton de communication', value: content.inputs?.tone || '-' },
    { label: 'Appel à l\'action (CTA)', value: content.inputs?.callToAction || '-' },
    { label: 'Détails Promo', value: content.inputs?.promoDetails || '-' },
    { label: 'Budget Indicatif', value: content.inputs?.budget ? String(content.inputs.budget) : '-' },
    {
      label: 'Piliers de contenu',
      value: content.inputs?.contentPillars && content.inputs.contentPillars.length > 0
        ? content.inputs.contentPillars.join(', ')
        : '-',
    },
    {
      label: 'Période',
      value: content.inputs?.startDate || content.inputs?.endDate
        ? `Du ${formatDate(content.inputs?.startDate)} au ${formatDate(content.inputs?.endDate)}`
        : '-',
    },
  ];

  return (
    <section className="space-y-6 pb-12">
       {/* Hero Premium Header */}
       <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 p-8 shadow-xl shadow-indigo-500/20">
         <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
         
         <div className="relative">
            <nav className="flex items-center gap-2 text-xs font-semibold text-indigo-200 mb-6">
               <Link href="/admin/content" className="hover:text-white transition">Contenu</Link>
               <span className="text-indigo-400">/</span>
               <span className="max-w-64 truncate text-white">{content.name}</span>
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
               <div className="flex flex-col sm:flex-row sm:items-start gap-5 flex-1">
                 <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                    <Megaphone className="h-8 w-8 text-white" />
                 </div>
                 
                 <div className="space-y-3">
                   <div>
                     <h1 className="text-2xl font-black text-white sm:text-3xl">
                       {content.name}
                     </h1>
                     <p className="text-sm font-medium text-indigo-200 flex items-center gap-1.5 mt-1">
                       <Briefcase className="w-4 h-4 text-indigo-300" />
                       Lié à : {content.strategy.businessName}
                     </p>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-2">
                     <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                       <Target className="w-3 h-3" /> {formatObjective(content.objective)}
                     </span>
                     <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${content.mode === 'ADS' ? 'bg-amber-500/20 text-amber-100 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30'}`}>
                        {formatMode(content.mode)}
                     </span>
                     <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                       <Globe className="w-3 h-3" /> {content.platforms.length} plateforme(s)
                     </span>
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-2 mt-2 lg:mt-0">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Rafraîchir
                  </button>
                  <Link
                    href="/admin/content"
                    className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </Link>
               </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/15 pt-5 text-sm text-indigo-200">
               <div className="flex items-center gap-1.5">
                 <User className="h-4 w-4" /> 
                 User: <span className="text-white font-semibold ml-1">{content.user.fullName} ({content.user.email})</span>
               </div>
               <div className="flex items-center gap-1.5 border-l border-white/15 pl-6">
                <Calendar className="h-4 w-4" />
                Créé le {new Date(content.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
         </div>
       </div>

       {/* Kpi grid */}
       <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {summaryCards.map((card, idx) => (
            <article key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 {idx === 0 && <Target className="w-16 h-16 text-indigo-900" />}
                 {idx === 1 && <Briefcase className="w-16 h-16 text-indigo-900" />}
                 {idx === 2 && <Layers3 className="w-16 h-16 text-indigo-900" />}
                 {idx === 3 && <Clock className="w-16 h-16 text-indigo-900" />}
               </div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 relative z-10">{card.label}</p>
               <p className="text-2xl font-black text-slate-900 relative z-10">{card.value}</p>
            </article>
         ))}
       </section>

       {/* details panels */}
       <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
             <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Infos Générales</h2>
             </div>
             <DetailGrid items={infoItems} />
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
             <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Paramètres de génération (Inputs)</h2>
             </div>
             <DetailGrid items={inputItems} />
          </article>
       </section>

       {/* AI Strategy summary */}
       <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
               <Target className="h-5 w-5" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-900">Résumé Stratégique IA</h2>
               <p className="text-sm text-slate-500">Direction globale proposée par l'intelligence artificielle</p>
             </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Pliliers de contenu retenus</p>
               {content.campaignSummary?.contentPillars?.length ? (
                 <div className="flex flex-wrap gap-2">
                   {content.campaignSummary.contentPillars.map((p, i) => (
                     <span key={i} className="inline-flex rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">{p}</span>
                   ))}
                 </div>
               ) : (
                <p className="text-sm font-medium text-slate-800">-</p>
               )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Plan de publication (Posting Plan)</p>
                <p className="text-base font-bold text-slate-900">
                  {content.campaignSummary?.postingPlan?.frequencyPerWeek ? `${content.campaignSummary.postingPlan.frequencyPerWeek} posts par semaine` : 'Fréquence non définie'}
                </p>
                {content.campaignSummary?.postingPlan?.durationWeeks && (
                  <p className="text-sm text-slate-500 font-medium mt-0.5">sur une durée de {content.campaignSummary.postingPlan.durationWeeks} semaines</p>
                )}
              </div>
            </article>
          </div>
       </section>

       {/* Generated Posts */}
       <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 ml-1">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
               <Megaphone className="h-5 w-5" />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-900">Posts générés</h2>
               <p className="text-sm text-slate-500">Liste exhaustive du contenu publicitaire et marketing créé</p>
             </div>
          </div>

          <div className="space-y-4">
            {content.generatedPosts.length > 0 ? (
               content.generatedPosts.map((post, index) => (
                  <PostCard key={post._id || `${post.platform}-${index}`} index={index} post={post} />
               ))
            ) : (
               <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm shadow-sm">
                  <Layers3 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-900">Aucun post généré pour cette campagne.</p>
                  <p className="text-slate-500 mt-1 max-w-sm mx-auto">La génération de contenu et/ou publicité a pu échouer.</p>
               </div>
            )}
          </div>
       </section>
    </section>
  );
}
