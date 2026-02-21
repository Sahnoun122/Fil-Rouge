'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStrategy, useStrategies } from '@/src/hooks/useStrategies';
import { OBJECTIVE_LABELS, TONE_LABELS } from '@/src/types/strategy.types';

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

interface StrategySectionCardProps {
  title: string;
  sectionKey: string;
  content: unknown;
  onRegenerate: (sectionKey: string, content: string) => void;
  isRegenerating: boolean;
}

function StrategySectionCard({
  title,
  sectionKey,
  content,
  onRegenerate,
  isRegenerating,
}: StrategySectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);

  const normalizedContent = formatSectionContent(content);
  const isLongContent = normalizedContent.length > 700;
  const displayContent =
    showFullContent || !isLongContent
      ? normalizedContent
      : `${normalizedContent.substring(0, 700)}...`;

  const handleRegenerate = () => {
    if (window.confirm(`Voulez-vous regenerer la section "${title}" ?`)) {
      onRegenerate(sectionKey, normalizedContent);
    }
  };

  return (
    <article className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <header
        className="cursor-pointer border-b border-gray-100 p-6 transition-colors hover:bg-gray-50"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className="mr-2 h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="mr-2 h-5 w-5 text-gray-400" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleRegenerate();
            }}
            disabled={isRegenerating}
            className="flex items-center rounded-lg px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50"
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerer
          </button>
        </div>
      </header>

      {isExpanded ? (
        <div className="p-6">
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-700">
            {displayContent}
          </pre>

          {isLongContent ? (
            <button
              type="button"
              onClick={() => setShowFullContent((prev) => !prev)}
              className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {showFullContent ? (
                <>
                  <EyeOff className="mr-1 h-4 w-4" />
                  Voir moins
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-4 w-4" />
                  Voir plus
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
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

  useEffect(() => {
    if (!strategyId) {
      router.replace('/user/strategies');
    }
  }, [router, strategyId]);

  const sectionItems = useMemo<SectionItem[]>(() => {
    if (!strategy?.generatedStrategy) return [];

    return [
      {
        title: 'Marche cible',
        sectionKey: 'avant.marcheCible',
        content: strategy.generatedStrategy.avant?.marcheCible,
      },
      {
        title: 'Message marketing',
        sectionKey: 'avant.messageMarketing',
        content: strategy.generatedStrategy.avant?.messageMarketing,
      },
      {
        title: 'Canaux de communication',
        sectionKey: 'avant.canauxCommunication',
        content: strategy.generatedStrategy.avant?.canauxCommunication,
      },
      {
        title: 'Capture de prospects',
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
        title: 'Experience client',
        sectionKey: 'apres.experienceClient',
        content: strategy.generatedStrategy.apres?.experienceClient,
      },
      {
        title: 'Augmentation valeur client',
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

  const handleDelete = async () => {
    if (!strategyId) return;
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette strategie ?')) return;

    setIsDeleting(true);
    try {
      await deleteStrategy(strategyId);
      toast.success('Strategie supprimee avec succes');
      router.push('/user/strategies');
    } catch {
      toast.error('Erreur lors de la suppression');
      setIsDeleting(false);
    }
  };

  const handleRegenerateSection = async (sectionKey: string, currentContent: string) => {
    if (!strategyId) return;
    setIsRegenerating(sectionKey);
    try {
      await regenerateSection(strategyId, sectionKey, currentContent);
      toast.success('Section regeneree avec succes');
      await loadStrategy(strategyId);
    } catch {
      toast.error('Erreur lors de la regeneration');
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 text-gray-500">
          Chargement de la strategie...
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Strategie introuvable</h2>
          <p className="mb-6 text-gray-600">{error || 'Cette strategie est indisponible.'}</p>
          <Link
            href="/user/strategies"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux strategies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/user/strategies" className="transition-colors hover:text-gray-700">
            Strategies
          </Link>
          <span>•</span>
          <span className="max-w-64 truncate font-medium text-gray-900">{strategy.businessInfo.businessName}</span>
        </nav>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                    {strategy.businessInfo.businessName}
                  </h1>
                  <p className="mb-4 text-lg text-gray-600">{strategy.businessInfo.industry}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                      {OBJECTIVE_LABELS[strategy.businessInfo.mainObjective]}
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                      {TONE_LABELS[strategy.businessInfo.tone]}
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      {strategy.businessInfo.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                <p className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Creee le {new Date(strategy.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <p className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Mise a jour le {new Date(strategy.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/user/swot/new?strategyId=${strategy._id}`}
                className="flex items-center rounded-lg bg-cyan-600 px-4 py-2 text-white transition-colors hover:bg-cyan-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Creer SWOT
              </Link>
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </button>
              <Link
                href={`/user/strategies/${strategy._id}/edit`}
                className="flex items-center rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8">
          {sectionItems.length > 0 ? (
            sectionItems.map((section) => (
              <StrategySectionCard
                key={section.sectionKey}
                title={section.title}
                sectionKey={section.sectionKey}
                content={section.content}
                onRegenerate={handleRegenerateSection}
                isRegenerating={isRegenerating === section.sectionKey}
              />
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              Strategie en cours de generation.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
