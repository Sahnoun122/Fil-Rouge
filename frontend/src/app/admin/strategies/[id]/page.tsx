'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Target,
  User,
  MapPin,
  FileText
} from 'lucide-react';
import { useAdminStrategy } from '@/src/hooks/useAdmin';

type SectionItem = {
  title: string;
  sectionKey: string;
  content: unknown;
};

const formatSectionContent = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'Contenu indisponible pour cette section.';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'Contenu indisponible pour cette section.';
  }
};

const OBJECTIVE_LABELS: Record<string, string> = {
  leads: 'Acquisition (Leads)',
  sales: 'Ventes',
  awareness: 'Notoriété',
  engagement: 'Engagement',
};

const TONE_LABELS: Record<string, string> = {
  friendly: 'Amical',
  professional: 'Professionnel',
  luxury: 'Luxe',
  young: 'Jeune & Dynamique',
};

interface StrategySectionCardProps {
  title: string;
  content: unknown;
  defaultOpen?: boolean;
}

function StrategySectionCard({ title, content, defaultOpen = true }: StrategySectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const normalizedContent = formatSectionContent(content);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-50">
      <header
        className="group flex cursor-pointer items-center justify-between bg-slate-50/50 p-5 transition-colors hover:bg-purple-50/50"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 shadow-sm transition-transform group-hover:scale-105 group-hover:text-purple-600 group-hover:border-purple-200">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
            {title}
          </h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 group-hover:border-purple-200 group-hover:text-purple-600 transition-all">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </header>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 p-6 bg-white">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700">
              {normalizedContent}
            </pre>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminStrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  const { strategy, error, isLoadingStrategy, loadStrategy } = useAdminStrategy();

  useEffect(() => {
    if (!strategyId) {
      return;
    }
    loadStrategy(strategyId).catch(() => undefined);
  }, [strategyId, loadStrategy]);

  const sectionItems = useMemo<SectionItem[]>(() => {
    if (!strategy?.generatedStrategy) {
      return [];
    }

    return [
      {
        title: 'Marché Cible',
        sectionKey: 'avant.marcheCible',
        content: strategy.generatedStrategy.avant?.marcheCible,
      },
      {
        title: 'Message Marketing',
        sectionKey: 'avant.messageMarketing',
        content: strategy.generatedStrategy.avant?.messageMarketing,
      },
      {
        title: 'Canaux de Communication',
        sectionKey: 'avant.canauxCommunication',
        content: strategy.generatedStrategy.avant?.canauxCommunication,
      },
      {
        title: 'Capture de Prospects (Leads)',
        sectionKey: 'pendant.captureProspects',
        content: strategy.generatedStrategy.pendant?.captureProspects,
      },
      {
        title: 'Nurturing',
        sectionKey: 'pendant.nurturing',
        content: strategy.generatedStrategy.pendant?.nurturing,
      },
      {
        title: 'Conversion',
        sectionKey: 'pendant.conversion',
        content: strategy.generatedStrategy.pendant?.conversion,
      },
      {
        title: 'Expérience Client',
        sectionKey: 'apres.experienceClient',
        content: strategy.generatedStrategy.apres?.experienceClient,
      },
      {
        title: 'Augmentation Valeur Client',
        sectionKey: 'apres.augmentationValeurClient',
        content: strategy.generatedStrategy.apres?.augmentationValeurClient,
      },
      {
        title: 'Recommandation',
        sectionKey: 'apres.recommandation',
        content: strategy.generatedStrategy.apres?.recommandation,
      },
    ];
  }, [strategy]);

  if (isLoadingStrategy) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-sm font-medium text-slate-500">Chargement de la stratégie...</p>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Stratégie introuvable</h2>
          <p className="mb-8 text-sm text-slate-600">
            {error || 'Cette stratégie est indisponible.'}
          </p>
          <Link
            href="/admin/strategies"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const objective = OBJECTIVE_LABELS[strategy.businessInfo.mainObjective] || strategy.businessInfo.mainObjective;
  const tone = TONE_LABELS[strategy.businessInfo.tone] || strategy.businessInfo.tone;

  return (
    <section className="space-y-6 pb-12">
      {/* Header Profile Area */}
      <header className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link href="/admin/strategies" className="hover:text-purple-700 transition">Stratégies</Link>
            <span>/</span>
            <span className="max-w-64 truncate text-slate-800">{strategy.businessInfo.businessName}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border border-purple-100 text-purple-600 shadow-sm">
                <Target className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                    {strategy.businessInfo.businessName}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    {strategy.businessInfo.industry}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    <Target className="w-3 h-3" /> {objective}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Ton : {tone}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <MapPin className="w-3 h-3" /> {strategy.businessInfo.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/strategies"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Meta info cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <User className="h-5 w-5" />
          </div>
           <div>
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Généré par</p>
             <p className="text-sm font-bold text-slate-900 line-clamp-1">{strategy.user.fullName}</p>
             <p className="text-xs font-medium text-slate-500 line-clamp-1">{strategy.user.email}</p>
           </div>
        </article>
        
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
           <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <Calendar className="h-5 w-5" />
           </div>
           <div>
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Création</p>
             <p className="text-sm font-bold text-slate-900">{new Date(strategy.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
             <p className="text-xs font-medium text-slate-500">{new Date(strategy.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3 sm:col-span-2 lg:col-span-1">
           <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
             <Clock className="h-5 w-5" />
           </div>
           <div>
             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernière mise à jour</p>
             <p className="text-sm font-bold text-slate-900">{new Date(strategy.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
             <p className="text-xs font-medium text-slate-500">{new Date(strategy.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
        </article>
      </section>

      {/* Sections */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 ml-1">Plan Stratégique IA</h2>
        <div className="space-y-4">
          {sectionItems.length > 0 ? (
            sectionItems.map((section, idx) => (
              <StrategySectionCard 
                key={section.sectionKey} 
                title={section.title} 
                content={section.content} 
                defaultOpen={idx === 0} // Open the first one by default
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm shadow-sm">
              <Target className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-900">Aucun plan trouvé</p>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                La stratégie est peut-être encore en cours de génération ou a rencontré une erreur.
              </p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
