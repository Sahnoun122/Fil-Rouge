'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import UserAiMonitoringService from '@/src/services/userAiMonitoringService';
import UserAiMonitoringStats from '@/src/components/user/ai-monitoring/UserAiMonitoringStats';
import UserAiMonitoringFilters from '@/src/components/user/ai-monitoring/UserAiMonitoringFilters';
import UserAiLogsTable from '@/src/components/user/ai-monitoring/UserAiLogsTable';
import UserAiLogDetailsModal from '@/src/components/user/ai-monitoring/UserAiLogDetailsModal';
import type {
  UserAiLog,
  UserAiLogsResult,
  UserAiMonitoringFilters as UserFilters,
  UserAiOverview,
  UserAiUsageByFeatureItem,
  UserAiUsageOverTimePoint,
} from '@/src/types/user-ai-monitoring.types';

const DEFAULT_FILTERS: UserFilters = {
  page: 1,
  limit: 10,
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const normalizeDateInput = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(normalized)) {
    return normalized;
  }

  const localPattern = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
  const localMatch = normalized.match(localPattern);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
};

const sanitizeFilters = (value: UserFilters): UserFilters => {
  let dateFrom = normalizeDateInput(value.dateFrom);
  let dateTo = normalizeDateInput(value.dateTo);

  if (dateFrom && dateTo && dateFrom > dateTo) {
    const previousFrom = dateFrom;
    dateFrom = dateTo;
    dateTo = previousFrom;
  }

  return {
    ...value,
    page: value.page && value.page > 0 ? value.page : 1,
    limit: value.limit && value.limit > 0 ? Math.min(100, value.limit) : 10,
    dateFrom,
    dateTo,
    actionType: value.actionType?.trim() || undefined,
  };
};

const areFiltersEqual = (left: UserFilters, right: UserFilters): boolean => {
  return JSON.stringify(left) === JSON.stringify(right);
};

const formatFeature = (featureType: string): string => {
  const labels: Record<string, string> = {
    strategy: 'Strategy',
    swot: 'SWOT',
    content: 'Content',
    planning: 'Planning',
  };

  return labels[featureType] || featureType;
};

function FeatureUsageChart({
  items,
  isLoading,
}: {
  items: UserAiUsageByFeatureItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Aucune donnée d&apos;utilisation disponible.
      </div>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.totalRequests), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.featureType}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{formatFeature(item.featureType)}</span>
            <span className="font-bold text-slate-900">{formatNumber(item.totalRequests)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-600 to-purple-500"
              style={{ width: `${Math.max(6, Math.round((item.totalRequests / maxValue) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function UsageOverTimeChart({
  points,
  isLoading,
}: {
  points: UserAiUsageOverTimePoint[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Aucune activité sur cette période.
      </div>
    );
  }

  const displayed = points.slice(-14);
  const maxValue = Math.max(...displayed.map((item) => item.totalRequests), 1);

  return (
    <div className="space-y-3">
      <div className="flex h-44 items-end gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {displayed.map((point) => (
          <div key={point.date} className="group relative flex flex-1 items-end justify-center">
            <div
              className="w-full rounded-t bg-linear-to-t from-violet-700 to-violet-400 transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(4, Math.round((point.totalRequests / maxValue) * 100))}%` }}
            />
            <div className="pointer-events-none absolute -top-8 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
              {point.totalRequests}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span>
          {displayed[0] ? DATE_FORMATTER.format(new Date(displayed[0].date)) : '-'}
        </span>
        <span>
          {displayed[displayed.length - 1]
            ? DATE_FORMATTER.format(new Date(displayed[displayed.length - 1].date))
            : '-'}
        </span>
      </div>
    </div>
  );
}

export default function UserAiMonitoringPage() {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [overview, setOverview] = useState<UserAiOverview | null>(null);
  const [usageByFeature, setUsageByFeature] = useState<UserAiUsageByFeatureItem[]>([]);
  const [usageOverTime, setUsageOverTime] = useState<UserAiUsageOverTimePoint[]>([]);
  const [logsResult, setLogsResult] = useState<UserAiLogsResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<UserAiLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const requestIdRef = useRef(0);

  const sortedUsageOverTime = useMemo(
    () => [...usageOverTime].sort((a, b) => a.date.localeCompare(b.date)),
    [usageOverTime],
  );

  const loadMonitoringData = useCallback(async (nextFilters: UserFilters) => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const [overviewResult, featureResult, usageOverTimeResult, logsResultData] =
        await Promise.allSettled([
          UserAiMonitoringService.getOverview(nextFilters),
          UserAiMonitoringService.getUsageByFeature(nextFilters),
          UserAiMonitoringService.getUsageOverTime(nextFilters),
          UserAiMonitoringService.getLogs(nextFilters),
        ]);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const failedSections: string[] = [];

      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value);
      } else {
        setOverview(null);
        failedSections.push('overview');
      }

      if (featureResult.status === 'fulfilled') {
        setUsageByFeature(featureResult.value);
      } else {
        setUsageByFeature([]);
        failedSections.push('usage by feature');
      }

      if (usageOverTimeResult.status === 'fulfilled') {
        setUsageOverTime(usageOverTimeResult.value);
      } else {
        setUsageOverTime([]);
        failedSections.push('usage over time');
      }

      if (logsResultData.status === 'fulfilled') {
        setLogsResult(logsResultData.value);
      } else {
        setLogsResult(null);
        failedSections.push('logs');
      }

      if (failedSections.length > 0) {
        toast.error(`Failed to load: ${failedSections.join(', ')}`);
      }
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      toast.error(error instanceof Error ? error.message : 'Failed to load AI monitoring data');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const safeFilters = sanitizeFilters(filters);

    if (!areFiltersEqual(safeFilters, filters)) {
      setFilters(safeFilters);
      return;
    }

    void loadMonitoringData(safeFilters);
  }, [filters, loadMonitoringData]);

  const handleApplyFilters = (nextFilters: UserFilters) => {
    const safeNextFilters = sanitizeFilters(nextFilters);
    setFilters((previous) => ({
      ...previous,
      ...safeNextFilters,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: filters.limit ?? 10,
    });
  };

  const handlePageChange = (nextPage: number) => {
    const totalPages = logsResult?.totalPages ?? 1;
    if (nextPage < 1 || nextPage > totalPages || isLoading) {
      return;
    }

    setFilters((previous) => ({
      ...previous,
      page: nextPage,
    }));
  };

  const handleRefresh = () => {
    void loadMonitoringData(filters);
  };

  const handleViewDetails = async (log: UserAiLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);

    try {
      const details = await UserAiMonitoringService.getLogById(log.id);
      setSelectedLog(details);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load log details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedLog(null);
  };

  return (
    <section className="space-y-6">
      <Toaster position="top-right" />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 shadow-sm shadow-violet-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monitoring IA</h1>
            <p className="text-sm text-slate-500">
              Suivez votre utilisation, performance et échecs de l&apos;IA.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </header>

      <UserAiMonitoringStats overview={overview} isLoading={isLoading} />

      <UserAiMonitoringFilters
        filters={filters}
        isLoading={isLoading}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <section className="grid gap-4 lg:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6">
          <h2 className="text-lg font-black text-slate-900">Utilisation par fonctionnalité</h2>
          <p className="mt-1 text-sm text-slate-500">Requêtes groupées par module IA.</p>
          <div className="mt-4">
            <FeatureUsageChart items={usageByFeature} isLoading={isLoading} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6">
          <h2 className="text-lg font-black text-slate-900">Utilisation dans le temps</h2>
          <p className="mt-1 text-sm text-slate-500">Tendance quotidienne de vos logs IA.</p>
          <div className="mt-4">
            <UsageOverTimeChart points={sortedUsageOverTime} isLoading={isLoading} />
          </div>
        </article>
      </section>

      <UserAiLogsTable
        logsResult={logsResult}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
      />

      <UserAiLogDetailsModal
        isOpen={isDetailsOpen}
        log={selectedLog}
        isLoading={isLoadingDetails}
        onClose={closeDetailsModal}
      />
    </section>
  );
}
