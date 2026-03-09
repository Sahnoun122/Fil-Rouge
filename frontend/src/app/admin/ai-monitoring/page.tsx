'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import AiMonitoringFilters from '@/src/components/admin/ai-monitoring/AiMonitoringFilters';
import AiLogDetailsModal from '@/src/components/admin/ai-monitoring/AiLogDetailsModal';
import AiLogsTable from '@/src/components/admin/ai-monitoring/AiLogsTable';
import AiMonitoringStats from '@/src/components/admin/ai-monitoring/AiMonitoringStats';
import AdminAiMonitoringService from '@/src/services/adminAiMonitoringService';
import type {
  AdminAiLog,
  AdminAiLogsResult,
  AdminAiMonitoringFilters,
  AdminAiOverview,
  AdminAiUsageByFeatureItem,
  AdminAiUsageByUserItem,
  UsageOverTimePoint,
} from '@/src/types/admin-ai-monitoring.types';

const DEFAULT_FILTERS: AdminAiMonitoringFilters = {
  page: 1,
  limit: 10,
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const buildTimelinePoints = (
  logs: AdminAiLog[],
  dateFrom?: string,
  dateTo?: string,
): UsageOverTimePoint[] => {
  const bucketByDate = new Map<string, UsageOverTimePoint>();

  for (const log of logs) {
    const date = new Date(log.createdAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = date.toISOString().slice(0, 10);
    const bucket = bucketByDate.get(key) ?? {
      date: key,
      label: DATE_FORMATTER.format(date),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
    };

    bucket.totalRequests += 1;
    if (log.status === 'success') {
      bucket.successfulRequests += 1;
    } else {
      bucket.failedRequests += 1;
    }

    bucketByDate.set(key, bucket);
  }

  if (bucketByDate.size === 0) {
    return [];
  }

  let minDate = new Date(dateFrom || '');
  if (Number.isNaN(minDate.getTime())) {
    minDate = new Date(Math.min(...Array.from(bucketByDate.keys()).map((item) => new Date(item).getTime())));
  }

  let maxDate = new Date(dateTo || '');
  if (Number.isNaN(maxDate.getTime())) {
    maxDate = new Date(Math.max(...Array.from(bucketByDate.keys()).map((item) => new Date(item).getTime())));
  }

  minDate.setHours(0, 0, 0, 0);
  maxDate.setHours(0, 0, 0, 0);

  if (minDate > maxDate) {
    return Array.from(bucketByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  const points: UsageOverTimePoint[] = [];

  for (let cursor = new Date(minDate); cursor <= maxDate; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toISOString().slice(0, 10);
    const existing = bucketByDate.get(key);

    if (existing) {
      points.push(existing);
    } else {
      points.push({
        date: key,
        label: DATE_FORMATTER.format(cursor),
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
      });
    }
  }

  return points;
};

function FeatureUsageChart({ items, isLoading }: { items: AdminAiUsageByFeatureItem[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        No feature usage data.
      </div>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.totalRequests), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.featureType}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{item.featureType.toUpperCase()}</span>
            <span className="font-bold text-slate-900">{formatNumber(item.totalRequests)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500"
              style={{ width: `${Math.max(6, Math.round((item.totalRequests / maxValue) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function UsageOverTimeChart({ points, isLoading }: { points: UsageOverTimePoint[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        No activity in this period.
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
              className="w-full rounded-t bg-linear-to-t from-cyan-600 to-cyan-400 transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(4, Math.round((point.totalRequests / maxValue) * 100))}%` }}
            />
            <div className="pointer-events-none absolute -top-8 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
              {point.totalRequests}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span>{displayed[0]?.label}</span>
        <span>{displayed[displayed.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function UserUsageChart({ items, isLoading }: { items: AdminAiUsageByUserItem[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  }

  const topUsers = items.slice(0, 7);

  if (topUsers.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        No user usage data.
      </div>
    );
  }

  const maxValue = Math.max(...topUsers.map((item) => item.totalRequests), 1);

  return (
    <div className="space-y-3">
      {topUsers.map((item) => {
        const fullName = item.user?.fullName?.trim() || 'Utilisateur';
        const email = item.user?.email?.trim() || '-';
        return (
          <div key={item.userId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{fullName}</p>
                <p className="truncate text-xs text-slate-500">{email}</p>
              </div>
              <p className="text-xs font-bold text-slate-900">{formatNumber(item.totalRequests)}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-500"
                style={{ width: `${Math.max(5, Math.round((item.totalRequests / maxValue) * 100))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAiMonitoringPage() {
  const [filters, setFilters] = useState<AdminAiMonitoringFilters>(DEFAULT_FILTERS);
  const [overview, setOverview] = useState<AdminAiOverview | null>(null);
  const [usageByFeature, setUsageByFeature] = useState<AdminAiUsageByFeatureItem[]>([]);
  const [usageByUser, setUsageByUser] = useState<AdminAiUsageByUserItem[]>([]);
  const [allUsers, setAllUsers] = useState<AdminAiUsageByUserItem[]>([]);
  const [logsResult, setLogsResult] = useState<AdminAiLogsResult | null>(null);
  const [timelineLogs, setTimelineLogs] = useState<AdminAiLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminAiLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const requestIdRef = useRef(0);

  const timeline = useMemo(
    () => buildTimelinePoints(timelineLogs, filters.dateFrom, filters.dateTo),
    [timelineLogs, filters.dateFrom, filters.dateTo],
  );

  const loadAllUsers = useCallback(async () => {
    try {
      const users = await AdminAiMonitoringService.getUsageByUser({
        limit: 100,
      });
      setAllUsers(users);
    } catch {
      // Non-bloquant pour la page
    }
  }, []);

  const loadMonitoringData = useCallback(async (nextFilters: AdminAiMonitoringFilters) => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const [overviewResult, featureResult, userResult, logsResultData, timelineResult] =
        await Promise.all([
          AdminAiMonitoringService.getOverview(nextFilters),
          AdminAiMonitoringService.getUsageByFeature(nextFilters),
          AdminAiMonitoringService.getUsageByUser({
            ...nextFilters,
            limit: 50,
          }),
          AdminAiMonitoringService.getLogs(nextFilters),
          AdminAiMonitoringService.getLogs({
            ...nextFilters,
            page: 1,
            limit: 100,
          }),
        ]);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setOverview(overviewResult);
      setUsageByFeature(featureResult);
      setUsageByUser(userResult);
      setLogsResult(logsResultData);
      setTimelineLogs(timelineResult.logs);
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      toast.error(error instanceof Error ? error.message : "Failed to load AI monitoring data");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAllUsers();
  }, [loadAllUsers]);

  useEffect(() => {
    void loadMonitoringData(filters);
  }, [filters, loadMonitoringData]);

  const handleApplyFilters = (nextFilters: AdminAiMonitoringFilters) => {
    setFilters((previous) => ({
      ...previous,
      ...nextFilters,
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

  const handleViewDetails = async (log: AdminAiLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);

    try {
      const details = await AdminAiMonitoringService.getLogById(log.id);
      setSelectedLog(details);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load log details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedLog(null);
  };

  const userOptions = useMemo(() => {
    if (allUsers.length > 0) {
      return allUsers;
    }

    return usageByUser;
  }, [allUsers, usageByUser]);

  return (
    <section className="space-y-6">
      <Toaster position="top-right" />

      <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-cyan-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-16 h-48 w-48 rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-indigo-200/30 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Administration</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">AI Monitoring</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Track AI usage, performance, failures, and user activity across strategy, SWOT, content, and planning.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      <AiMonitoringStats overview={overview} isLoading={isLoading} />

      <AiMonitoringFilters
        filters={filters}
        users={userOptions}
        isLoading={isLoading}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <section className="grid gap-4 lg:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
          <h2 className="text-lg font-black text-slate-900">Usage by Feature</h2>
          <p className="mt-1 text-sm text-slate-500">Requests per AI capability.</p>
          <div className="mt-4">
            <FeatureUsageChart items={usageByFeature} isLoading={isLoading} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
          <h2 className="text-lg font-black text-slate-900">Usage over Time</h2>
          <p className="mt-1 text-sm text-slate-500">Activity trend based on AI logs.</p>
          <div className="mt-4">
            <UsageOverTimeChart points={timeline} isLoading={isLoading} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
          <h2 className="text-lg font-black text-slate-900">Usage by User</h2>
          <p className="mt-1 text-sm text-slate-500">Most active users in selected period.</p>
          <div className="mt-4">
            <UserUsageChart items={usageByUser} isLoading={isLoading} />
          </div>
        </article>
      </section>

      <AiLogsTable
        logsResult={logsResult}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
      />

      <AiLogDetailsModal
        isOpen={isDetailsOpen}
        log={selectedLog}
        isLoading={isLoadingDetails}
        onClose={closeDetailsModal}
      />
    </section>
  );
}
