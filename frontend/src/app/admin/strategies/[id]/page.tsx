'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
  User,
} from 'lucide-react';
import { useAdminStrategy } from '@/src/hooks/useAdmin';

type SectionItem = {
  title: string;
  sectionKey: string;
  content: unknown;
  phase: 'avant' | 'pendant' | 'apres';
};

const PHASE_CONFIG = {
  avant: {
    label: 'Avant',
    description: 'Attirer & Sensibiliser',
    color: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    headerBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
    icon: Target,
  },
  pendant: {
    label: 'Pendant',
    description: 'Convertir & Engager',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    headerBg: 'bg-gradient-to-r from-indigo-600 to-violet-600',
    icon: Zap,
  },
  apres: {
    label: 'Après',
    description: 'Fidéliser & Recommander',
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    headerBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    icon: Sparkles,
  },
};

const toLabel = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

function RenderContent({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <p className="italic text-slate-400 text-sm">Contenu indisponible.</p>;
  }

  if (typeof value === 'string') {
    const paragraphs = value.split(/\n{2,}/);
    return (
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-700">
            {para.split('\n').map((line, j) => (
              <span key={j}>{line}{j < para.split('\n').length - 1 && <br />}</span>
            ))}
          </p>
        ))}
      </div>
    );
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <p className="text-sm text-slate-700">{String(value)}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {value.filter(Boolean).map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            <div className="flex-1">
              <RenderContent value={item} depth={depth + 1} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== null && v !== undefined && v !== '');
    return (
      <div className={`space-y-4 ${depth > 0 ? 'pl-4 border-l-2 border-slate-100' : ''}`}>
        {entries.map(([key, val]) => (
          <div key={key}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {toLabel(key)}
            </p>
            <RenderContent value={val} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

interface StrategySectionCardProps {
  title: string;
  content: unknown;
  phase: 'avant' | 'pendant' | 'apres';
}

function StrategySectionCard({ title, content, phase }: StrategySectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const cfg = PHASE_CONFIG[phase];

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
          <RenderContent value={content} />
        </div>
      )}
    </article>
  );
}

interface PhaseGroupProps {
  phase: 'avant' | 'pendant' | 'apres';
  sections: SectionItem[];
}

function PhaseGroup({ phase, sections }: PhaseGroupProps) {
  const cfg = PHASE_CONFIG[phase];
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
          <StrategySectionCard
            key={section.sectionKey}
            title={section.title}
            content={section.content}
            phase={phase}
          />
        ))}
      </div>
    </div>
  );
}

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

export default function AdminStrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  const { strategy, error, isLoadingStrategy, loadStrategy } = useAdminStrategy();

  useEffect(() => {
    if (!strategyId) return;
    loadStrategy(strategyId).catch(() => undefined);
  }, [strategyId, loadStrategy]);

  const sectionItems = useMemo<SectionItem[]>(() => {
    if (!strategy?.generatedStrategy) return [];

    return [
      { title: 'Marché Cible', sectionKey: 'avant.marcheCible', content: strategy.generatedStrategy.avant?.marcheCible, phase: 'avant' },
      { title: 'Message Marketing', sectionKey: 'avant.messageMarketing', content: strategy.generatedStrategy.avant?.messageMarketing, phase: 'avant' },
      { title: 'Canaux de Communication', sectionKey: 'avant.canauxCommunication', content: strategy.generatedStrategy.avant?.canauxCommunication, phase: 'avant' },
      { title: 'Capture de Prospects (Leads)', sectionKey: 'pendant.captureProspects', content: strategy.generatedStrategy.pendant?.captureProspects, phase: 'pendant' },
      { title: 'Nurturing', sectionKey: 'pendant.nurturing', content: strategy.generatedStrategy.pendant?.nurturing, phase: 'pendant' },
      { title: 'Conversion', sectionKey: 'pendant.conversion', content: strategy.generatedStrategy.pendant?.conversion, phase: 'pendant' },
      { title: 'Expérience Client', sectionKey: 'apres.experienceClient', content: strategy.generatedStrategy.apres?.experienceClient, phase: 'apres' },
      { title: 'Augmentation Valeur Client', sectionKey: 'apres.augmentationValeurClient', content: strategy.generatedStrategy.apres?.augmentationValeurClient, phase: 'apres' },
      { title: 'Recommandation', sectionKey: 'apres.recommandation', content: strategy.generatedStrategy.apres?.recommandation, phase: 'apres' },
    ];
  }, [strategy]);

  const avantSections = sectionItems.filter((s) => s.phase === 'avant');
  const pendantSections = sectionItems.filter((s) => s.phase === 'pendant');
  const apresSections = sectionItems.filter((s) => s.phase === 'apres');

  const handleRefresh = async () => {
    if (!strategyId) return;
    await loadStrategy(strategyId);
  };

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
      {/* Header Profile Area (Premium Admin Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 shadow-xl shadow-purple-500/20">
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative">
          <nav className="flex items-center gap-2 text-xs font-semibold text-purple-200 mb-6">
            <Link href="/admin/strategies" className="hover:text-white transition">Stratégies</Link>
            <span className="text-purple-400">/</span>
            <span className="max-w-64 truncate text-white">{strategy.businessInfo.businessName}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 flex-1">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-black text-white sm:text-3xl">
                    {strategy.businessInfo.businessName}
                  </h1>
                  <p className="text-sm font-medium text-purple-200 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4 text-purple-300" />
                    {strategy.businessInfo.industry}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                    <Target className="w-3 h-3" /> {objective}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                    <FileText className="h-3 w-3" /> Ton : {tone}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20">
                    <MapPin className="w-3 h-3" /> {strategy.businessInfo.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 lg:mt-0">
               <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
              >
                <RefreshCw className="h-4 w-4" />
                Rafraîchir
              </button>
              <Link
                href="/admin/strategies"
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/15 pt-5 text-sm text-purple-200">
             <div className="flex items-center gap-1.5">
               <User className="h-4 w-4" /> 
               Généré par <span className="text-white font-semibold ml-1">{strategy.user.fullName} ({strategy.user.email})</span>
             </div>
             <div className="flex items-center gap-1.5 border-l border-white/15 pl-6">
              <Calendar className="h-4 w-4" />
              Créé le {new Date(strategy.createdAt).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/15 pl-6">
              <Clock className="h-4 w-4" />
              Mis à jour le {new Date(strategy.updatedAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 ml-1 mb-6">Plan Stratégique IA</h2>
        
        {sectionItems.length > 0 ? (
          <div className="space-y-10">
            {avantSections.length > 0 && <PhaseGroup phase="avant" sections={avantSections} />}
            {pendantSections.length > 0 && <PhaseGroup phase="pendant" sections={pendantSections} />}
            {apresSections.length > 0 && <PhaseGroup phase="apres" sections={apresSections} />}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm shadow-sm">
            <Target className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-900">Aucun plan trouvé</p>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              La stratégie est peut-être encore en cours de génération ou a rencontré une erreur.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
