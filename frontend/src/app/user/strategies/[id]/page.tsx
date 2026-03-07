'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';
import { useStrategy, useStrategies } from '@/src/hooks/useStrategies';
import { OBJECTIVE_LABELS, TONE_LABELS } from '@/src/types/strategy.types';

type SectionItem = {
  title: string;
  sectionKey: string;
  content: unknown;
  phase: 'avant' | 'pendant' | 'apres';
};

const PHASE_CONFIG = {
  avant: {
    label: 'Before',
    description: 'Attract & Raise Awareness',
    color: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
    headerBg: 'bg-linear-to-r from-violet-600 to-purple-600',
    icon: Target,
  },
  pendant: {
    label: 'During',
    description: 'Convert & Engage',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    dot: 'bg-indigo-500',
    headerBg: 'bg-linear-to-r from-indigo-600 to-violet-600',
    icon: Zap,
  },
  apres: {
    label: 'After',
    description: 'Retain & Recommend',
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
    headerBg: 'bg-linear-to-r from-purple-600 to-pink-600',
    icon: Sparkles,
  },
};

const toLabel = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

function RenderContent({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <p className="italic text-slate-400 text-sm">Content unavailable.</p>;
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

const getRawText = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return ''; }
};

interface StrategySectionCardProps {
  title: string;
  sectionKey: string;
  content: unknown;
  phase: 'avant' | 'pendant' | 'apres';
  onRegenerate: (sectionKey: string, content: string) => void;
  isRegenerating: boolean;
}

function StrategySectionCard({
  title,
  sectionKey,
  content,
  phase,
  onRegenerate,
  isRegenerating,
}: StrategySectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const cfg = PHASE_CONFIG[phase];
  const rawText = getRawText(content);

  const handleRegenerate = () => {
    if (window.confirm(`Do you want to regenerate the "${title}" section?`)) {
      onRegenerate(sectionKey, rawText);
    }
  };

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

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
            disabled={isRegenerating}
            className={`flex items-center gap-1.5 rounded-xl border ${cfg.border} ${cfg.bg} px-3 py-1.5 text-xs font-medium text-${cfg.color}-700 transition-all hover:shadow-sm disabled:opacity-50`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
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
  onRegenerate: (sectionKey: string, content: string) => void;
  isRegenerating: string | null;
}

function PhaseGroup({ phase, sections, onRegenerate, isRegenerating }: PhaseGroupProps) {
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
            sectionKey={section.sectionKey}
            content={section.content}
            phase={phase}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating === section.sectionKey}
          />
        ))}
      </div>
    </div>
  );
}

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const { strategy, isLoading, error, loadStrategy } = useStrategy(strategyId);
  const { regenerateSection, deleteStrategy } = useStrategies();
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!strategyId) {
      router.replace('/user/strategies');
    }
  }, [router, strategyId]);

  const sectionItems = useMemo<SectionItem[]>(() => {
    if (!strategy?.generatedStrategy) return [];

    return [
      { title: 'Target Market', sectionKey: 'avant.marcheCible', content: strategy.generatedStrategy.avant?.marcheCible, phase: 'avant' },
      { title: 'Marketing Message', sectionKey: 'avant.messageMarketing', content: strategy.generatedStrategy.avant?.messageMarketing, phase: 'avant' },
      { title: 'Communication Channels', sectionKey: 'avant.canauxCommunication', content: strategy.generatedStrategy.avant?.canauxCommunication, phase: 'avant' },
      { title: 'Lead Capture', sectionKey: 'pendant.captureProspects', content: strategy.generatedStrategy.pendant?.captureProspects, phase: 'pendant' },
      { title: 'Nurturing', sectionKey: 'pendant.nurturing', content: strategy.generatedStrategy.pendant?.nurturing, phase: 'pendant' },
      { title: 'Conversion', sectionKey: 'pendant.conversion', content: strategy.generatedStrategy.pendant?.conversion, phase: 'pendant' },
      { title: 'Customer Experience', sectionKey: 'apres.experienceClient', content: strategy.generatedStrategy.apres?.experienceClient, phase: 'apres' },
      { title: 'Customer Value Growth', sectionKey: 'apres.augmentationValeurClient', content: strategy.generatedStrategy.apres?.augmentationValeurClient, phase: 'apres' },
      { title: 'Referral', sectionKey: 'apres.recommandation', content: strategy.generatedStrategy.apres?.recommandation, phase: 'apres' },
    ];
  }, [strategy]);

  const avantSections = sectionItems.filter((s) => s.phase === 'avant');
  const pendantSections = sectionItems.filter((s) => s.phase === 'pendant');
  const apresSections = sectionItems.filter((s) => s.phase === 'apres');

  const handleDelete = async () => {
    if (!strategyId) return;
    setIsDeleting(true);
    try {
      await deleteStrategy(strategyId);
      toast.success('Strategy deleted successfully');
      router.push('/user/strategies');
    } catch {
      toast.error('Error deleting strategy');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRegenerateSection = async (sectionKey: string, currentContent: string) => {
    if (!strategyId) return;
    setIsRegenerating(sectionKey);
    try {
      await regenerateSection(strategyId, sectionKey, currentContent);
      toast.success('Section regenerated successfully');
      await loadStrategy(strategyId);
    } catch {
      toast.error('Error regenerating section');
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleRefresh = async () => {
    if (!strategyId) return;
    await loadStrategy(strategyId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-medium text-slate-600">Loading strategy...</p>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Strategy not found</h2>
          <p className="mb-6 text-sm text-slate-600">{error || 'This strategy is unavailable.'}</p>
          <Link
            href="/user/strategies"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to strategies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/user/strategies"
          className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Strategies
        </Link>
        <span className="text-slate-300">/</span>
        <span className="max-w-64 truncate font-medium text-slate-700">
          {strategy.businessInfo.businessName}
        </span>
      </nav>

      {/* Hero header card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-600 via-violet-700 to-purple-700 p-8 shadow-xl shadow-violet-500/20">
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold text-white lg:text-3xl">
                  {strategy.businessInfo.businessName}
                </h1>
                <p className="mb-4 text-base text-violet-200">{strategy.businessInfo.industry}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                    <Target className="h-3 w-3" />
                    {OBJECTIVE_LABELS[strategy.businessInfo.mainObjective]}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                    <FileText className="h-3 w-3" />
                    {TONE_LABELS[strategy.businessInfo.tone]}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                    <MapPin className="h-3 w-3" />
                    {strategy.businessInfo.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <Link
                href={`/user/strategies/${strategy._id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-medium text-white ring-1 ring-red-400/40 transition-all hover:bg-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/15 pt-5 text-sm text-violet-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created on {new Date(strategy.createdAt).toLocaleDateString('en-US')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Updated on {new Date(strategy.updatedAt).toLocaleDateString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href={`/swot/new?strategyId=${strategy._id}`}
          className="group flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm shadow-slate-200/50 transition-all hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-violet-700">Create a SWOT analysis</p>
            <p className="text-xs text-slate-500">Based on this strategy</p>
          </div>
        </Link>

        <Link
          href={`/user/content/new?strategyId=${strategy._id}`}
          className="group flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm shadow-slate-200/50 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">Generate content</p>
            <p className="text-xs text-slate-500">Posts, articles, campaigns</p>
          </div>
        </Link>

        <Link
          href={`/swot?strategyId=${strategy._id}`}
          className="group flex items-center gap-3 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm shadow-slate-200/50 transition-all hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-pink-600">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-700">View linked SWOT analyses</p>
            <p className="text-xs text-slate-500">Existing analyses</p>
          </div>
        </Link>
      </div>

      {/* Strategy content */}
      {sectionItems.length > 0 ? (
        <div className="space-y-10">
          {avantSections.length > 0 && (
            <PhaseGroup phase="avant" sections={avantSections} onRegenerate={handleRegenerateSection} isRegenerating={isRegenerating} />
          )}
          {pendantSections.length > 0 && (
            <PhaseGroup phase="pendant" sections={pendantSections} onRegenerate={handleRegenerateSection} isRegenerating={isRegenerating} />
          )}
          {apresSections.length > 0 && (
            <PhaseGroup phase="apres" sections={apresSections} onRegenerate={handleRegenerateSection} isRegenerating={isRegenerating} />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm shadow-slate-200/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
            <Sparkles className="h-8 w-8 text-violet-400" />
          </div>
          <p className="font-medium text-slate-700">Strategy is being generated...</p>
          <p className="mt-1 text-sm text-slate-500">Check back in a few moments.</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Delete strategy</h3>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{strategy.businessInfo.businessName}</span>?
              This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition-all hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
