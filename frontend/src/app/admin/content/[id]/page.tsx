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
  MapPin,
  Megaphone,
  RefreshCw,
  Sparkles,
  Target,
  User,
  Zap,
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
  return value === 'ADS' ? 'Publicité (Ads)' : 'Contenu Marketing';
};

const formatObjective = (value: string): string => {
  const labels: Record<string, string> = {
    leads: 'Acquisition (Leads)',
    sales: 'Ventes',
    awareness: 'Notoriété',
    engagement: 'Engagement',
  };
  return labels[value] || value;
};

// --- ACCORDION SYSTEM ---

const GROUP_CONFIG = {
  general: {
    label: 'Informations',
    description: 'Détails de la campagne et paramètres associés',
    color: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    headerBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
    icon: Briefcase,
  },
  strategy: {
    label: 'Stratégie IA',
    description: 'Bases stratégiques générées par l\'intelligence artificielle',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    headerBg: 'bg-gradient-to-r from-indigo-600 to-violet-600',
    icon: Sparkles,
  },
  posts: {
    label: 'Publications',
    description: 'Liste des posts générés prêts à être publiés',
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    headerBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    icon: Megaphone,
  },
};

type GroupKey = keyof typeof GROUP_CONFIG;

type SectionItem = {
  title: string;
  sectionKey: string;
  content: React.ReactNode;
  group: GroupKey;
};

function ContentSectionCard({ title, content, group }: { title: string; content: React.ReactNode; group: GroupKey }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const cfg = GROUP_CONFIG[group];

  return (
    <article className={`rounded-2xl border bg-white shadow-sm shadow-slate-200/50 overflow-hidden transition-all duration-200 ${cfg.border}`}>
      <header
        className="cursor-pointer p-5 transition-colors hover:bg-slate-50/80"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
              {isExpanded ? (
                <ChevronDown className={`h-4 w-4 text-${cfg.color}-600`} />
              ) : (
                <ChevronRight className={`h-4 w-4 text-${cfg.color}-600`} />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>
      </header>
      {isExpanded && (
        <div className="border-t border-slate-100 p-5">
          {content}
        </div>
      )}
    </article>
  );
}

function SectionGroup({ group, sections }: { group: GroupKey; sections: SectionItem[] }) {
  const cfg = GROUP_CONFIG[group];
  const Icon = cfg.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.headerBg}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{cfg.label}</h2>
          <p className="text-sm text-slate-500">{cfg.description}</p>
        </div>
        <div className={`ml-auto rounded-full ${cfg.badge} px-3 py-1 text-xs font-semibold`}>
          {sections.length} section{sections.length > 1 ? 's' : ''}
        </div>
      </div>
      <div className="space-y-3">
        {sections.map((section) => (
          <ContentSectionCard
            key={section.sectionKey}
            title={section.title}
            content={section.content}
            group={group}
          />
        ))}
      </div>
    </div>
  );
}

function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
          <p className="text-sm font-medium text-slate-800 break-words">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function PostVariantCard({ post }: { post: GeneratedPost }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
           <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Plateforme & Format</p>
           <div className="flex items-center gap-2">
             <span className="inline-flex rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wide">
               {post.platform}
             </span>
             <span className="text-sm font-semibold text-slate-700">{post.type || 'Standard'}</span>
           </div>
        </div>
        
        {post.schedule && (
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Prévue</p>
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {post.schedule.date} à {post.schedule.time}
            </p>
          </div>
        )}
      </div>

      {post.title && (
         <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Titre</p>
            <p className="text-base font-bold text-slate-900">{post.title}</p>
         </div>
      )}

      <div className="space-y-1">
         <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contenu (Caption)</p>
         <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
           <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{post.caption}</p>
         </div>
      </div>

      {post.description && (
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{post.description}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
         {post.hook && (
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Accroche (Hook)</p>
            <p className="text-sm font-medium text-slate-800">{post.hook}</p>
          </div>
         )}
         {post.cta && (
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Appel à l'action (CTA)</p>
            <p className="text-sm font-medium text-slate-800">{post.cta}</p>
          </div>
         )}
      </div>

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hashtags</p>
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span key={tag} className="text-sm font-semibold text-purple-600">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {post.suggestedVisual && (
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Visuel suggéré</p>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
             <p className="text-sm font-medium text-slate-700 flex items-start gap-2">
               <span className="text-xl">📸</span>
               {post.suggestedVisual}
             </p>
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
                <div key={idx} className={`rounded-xl border ${variant.border} ${variant.bg} p-4`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${variant.color}`}>
                    {variant.title}
                  </p>
                  <p className="text-sm text-slate-800 font-medium">{variant.content}</p>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
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

  const handleRefresh = async () => {
    if (!contentId) return;
    await loadContent(contentId);
  };

  const sectionItems = useMemo<SectionItem[]>(() => {
    if (!content) return [];

    const items: SectionItem[] = [];

    // General Group
    items.push({
      title: 'Infos Générales',
      sectionKey: 'general.infos',
      group: 'general',
      content: (
        <DetailGrid items={[
          { label: 'Nom de la campagne', value: content.name },
          { label: 'Entreprise Cliente', value: content.user.companyName || '-' },
          { label: 'Business Associé', value: content.strategy.businessName || '-' },
          { label: 'Secteur d\'activité', value: content.strategy.industry || '-' },
          { label: 'Créée le', value: formatDate(content.createdAt) },
        ]} />
      )
    });

    items.push({
      title: 'Paramètres (Inputs)',
      sectionKey: 'general.inputs',
      group: 'general',
      content: (
        <DetailGrid items={[
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
        ]} />
      )
    });

    // Strategy Group
    if (content.campaignSummary) {
      items.push({
        title: 'Résumé de la ligne éditoriale',
        sectionKey: 'strategy.summary',
        group: 'strategy',
        content: (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pliliers de contenu retenus</p>
               {content.campaignSummary.contentPillars?.length ? (
                 <ul className="list-disc pl-5 space-y-1 text-sm font-medium text-slate-700">
                   {content.campaignSummary.contentPillars.map((p, i) => (
                     <li key={i}>{p}</li>
                   ))}
                 </ul>
               ) : (
                <p className="text-sm font-medium text-slate-800">-</p>
               )}
            </div>

            <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Plan de publication</p>
                <p className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {content.campaignSummary.postingPlan?.frequencyPerWeek ? `${content.campaignSummary.postingPlan.frequencyPerWeek} posts par semaine` : 'Fréquence non définie'}
                </p>
                {content.campaignSummary.postingPlan?.durationWeeks && (
                  <p className="text-sm text-slate-500 font-medium ml-5 mt-0.5">sur une durée de {content.campaignSummary.postingPlan.durationWeeks} semaines</p>
                )}
            </div>
          </div>
        )
      });
    }

    // Posts Group
    if (content.generatedPosts && content.generatedPosts.length > 0) {
       content.generatedPosts.forEach((post, index) => {
         items.push({
           title: `Post #${index + 1} - ${post.platform}`,
           sectionKey: `posts.item_${index}`,
           group: 'posts',
           content: <PostVariantCard post={post} />
         });
       });
    }

    return items;
  }, [content]);

  const generalSections = sectionItems.filter((s) => s.group === 'general');
  const strategySections = sectionItems.filter((s) => s.group === 'strategy');
  const postsSections = sectionItems.filter((s) => s.group === 'posts');

  if (isLoadingContent) {
     return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
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

  const kpis = [
      { label: 'Posts générés', value: String(content.generatedPosts.length), icon: Layers3 },
      { label: 'Plateformes', value: String(content.platforms.length), icon: Globe },
      {
        label: 'Fréquence',
        value: content.campaignSummary?.postingPlan?.frequencyPerWeek
          ? `${content.campaignSummary.postingPlan.frequencyPerWeek}/sem.`
          : '-',
        icon: Clock
      },
  ];

  return (
    <section className="space-y-6 pb-12">
       {/* Simple Light Header */}
       <header className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-5 sm:p-6 shadow-sm">
         <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />
         <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-purple-200/25 blur-3xl" />
         
         <div className="relative">
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-5">
               <Link href="/admin/content" className="hover:text-violet-700 transition">Contenu</Link>
               <span>/</span>
               <span className="max-w-64 truncate text-slate-800">{content.name}</span>
            </nav>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
               <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-violet-200 shadow-sm">
                    <Megaphone className="h-6 w-6 text-violet-600" />
                 </div>
                 
                 <div className="space-y-2">
                   <div>
                     <div className="flex items-center gap-2">
                       <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                         {content.name}
                       </h1>
                       <span className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${content.mode === 'ADS' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>
                          {formatMode(content.mode)}
                       </span>
                     </div>
                     <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                       <Building2 className="w-3.5 h-3.5 text-violet-500" />
                       Lié à : <span className="text-slate-700 font-semibold">{content.strategy.businessName}</span>
                     </p>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-2 mt-1">
                     <span className="sm:hidden inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-violet-50 text-violet-700 border-violet-200">
                        {formatMode(content.mode)}
                     </span>
                     <span className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                       <Target className="w-3 h-3 text-slate-400" /> {formatObjective(content.objective)}
                     </span>
                     <span className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                       <Globe className="w-3 h-3 text-slate-400" /> {content.platforms.join(', ')}
                     </span>
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-2 mt-1 lg:mt-0">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    Rafraîchir
                  </button>
                  <Link
                    href="/admin/content"
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    Retour
                  </Link>
               </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-200/60 pt-3 text-[11px] font-medium text-slate-500">
               <div className="flex items-center gap-1.5">
                 <User className="h-3.5 w-3.5 text-slate-400" /> 
                 User: <span className="text-slate-800 font-semibold ml-1">{content.user.fullName} ({content.user.email})</span>
               </div>
               <div className="flex items-center gap-1.5 sm:border-l border-slate-200/60 sm:pl-4">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Créé le {new Date(content.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
         </div>
       </header>

       {/* Kpi Stats Row (from Calendar layout) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
                </div>
                <div className="rounded-xl border p-2.5 bg-violet-50 text-violet-600 border-violet-100">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

       {/* Sections Layout (Matching Strategy Structure) */}
       <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 ml-1 mb-6 mt-4">Contenu & Paramètres</h2>

          {sectionItems.length > 0 ? (
             <div className="space-y-10">
                {generalSections.length > 0 && <SectionGroup group="general" sections={generalSections} />}
                {strategySections.length > 0 && <SectionGroup group="strategy" sections={strategySections} />}
                {postsSections.length > 0 && <SectionGroup group="posts" sections={postsSections} />}
             </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm shadow-sm">
              <Megaphone className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-900">Aucun détail trouvé</p>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                La campagne est peut-être encore en cours de génération ou a rencontré une erreur.
              </p>
            </div>
          )}
       </section>
    </section>
  );
}
