'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
} from 'lucide-react';
import { useAdminStrategy } from '@/src/hooks/useAdmin';

type SectionItem = {
  title: string;
  sectionKey: string;
  content: unknown;
};

const formatSectionContent = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'Content unavailable for this section.';
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
    return 'Content unavailable for this section.';
  }
};

const OBJECTIVE_LABELS: Record<string, string> = {
  leads: 'Leads',
  sales: 'Sales',
  awareness: 'Awareness',
  engagement: 'Engagement',
};

const TONE_LABELS: Record<string, string> = {
  friendly: 'Friendly',
  professional: 'Professional',
  luxury: 'Luxury',
  young: 'Young',
};

interface StrategySectionCardProps {
  title: string;
  content: unknown;
}

function StrategySectionCard({ title, content }: StrategySectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const normalizedContent = formatSectionContent(content);

  return (
    <article className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <header
        className="cursor-pointer border-b border-gray-100 p-6 transition-colors hover:bg-gray-50"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="mr-2 h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="mr-2 h-5 w-5 text-gray-400" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </header>

      {isExpanded ? (
        <div className="p-6">
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-700">
            {normalizedContent}
          </pre>
        </div>
      ) : null}
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
        title: 'Target Market',
        sectionKey: 'avant.marcheCible',
        content: strategy.generatedStrategy.avant?.marcheCible,
      },
      {
        title: 'Marketing Message',
        sectionKey: 'avant.messageMarketing',
        content: strategy.generatedStrategy.avant?.messageMarketing,
      },
      {
        title: 'Communication Channels',
        sectionKey: 'avant.canauxCommunication',
        content: strategy.generatedStrategy.avant?.canauxCommunication,
      },
      {
        title: 'Lead Capture',
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
        title: 'Customer Experience',
        sectionKey: 'apres.experienceClient',
        content: strategy.generatedStrategy.apres?.experienceClient,
      },
      {
        title: 'Customer Value Growth',
        sectionKey: 'apres.augmentationValeurClient',
        content: strategy.generatedStrategy.apres?.augmentationValeurClient,
      },
      {
        title: 'Referral',
        sectionKey: 'apres.recommandation',
        content: strategy.generatedStrategy.apres?.recommandation,
      },
    ];
  }, [strategy]);

  if (isLoadingStrategy) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 text-gray-500">
          Loading strategy...
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Strategy not found</h2>
          <p className="mb-6 text-gray-600">{error || 'This strategy is unavailable.'}</p>
          <Link
            href="/admin/strategies"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to strategies
          </Link>
        </div>
      </div>
    );
  }

  const objective = OBJECTIVE_LABELS[strategy.businessInfo.mainObjective] || strategy.businessInfo.mainObjective;
  const tone = TONE_LABELS[strategy.businessInfo.tone] || strategy.businessInfo.tone;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/admin/strategies" className="transition-colors hover:text-gray-700">
            Admin strategies
          </Link>
          <span>-</span>
          <span className="max-w-64 truncate font-medium text-gray-900">{strategy.businessInfo.businessName}</span>
        </nav>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                    {strategy.businessInfo.businessName}
                  </h1>
                  <p className="mb-4 text-lg text-gray-600">{strategy.businessInfo.industry}</p>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">{objective}</span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">{tone}</span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      {strategy.businessInfo.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                <p className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {strategy.user.fullName} ({strategy.user.email})
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created on {new Date(strategy.createdAt).toLocaleDateString('en-US')}
                </p>
                <p className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Updated on {new Date(strategy.updatedAt).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Link
                href="/admin/strategies"
                className="flex items-center rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8">
          {sectionItems.length > 0 ? (
            sectionItems.map((section) => (
              <StrategySectionCard key={section.sectionKey} title={section.title} content={section.content} />
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              Strategy is being generated.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
