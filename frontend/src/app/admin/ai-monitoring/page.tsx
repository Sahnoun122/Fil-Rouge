'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BarChart2, Activity, Users, Download, RefreshCw, Zap, Sparkles } from 'lucide-react';
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

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  day: 'numeric',
});

const formatNumber = (value: number): string => new Intl.NumberFormat('fr-FR').format(value);

const normalizeDateInput = (value?: string): string | undefined => {
  if (!value) return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(normalized)) return normalized;
  const localPattern = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
  const localMatch = normalized.match(localPattern);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

const sanitizeFilters = (value: AdminAiMonitoringFilters): AdminAiMonitoringFilters => {
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
    userSearch: value.userSearch?.trim() || undefined,
  };
};

const areFiltersEqual = (left: AdminAiMonitoringFilters, right: AdminAiMonitoringFilters): boolean => {
  return JSON.stringify(left) === JSON.stringify(right);
};

const buildTimelinePoints = (logs: AdminAiLog[], dateFrom?: string, dateTo?: string): UsageOverTimePoint[] => {
  const bucketByDate = new Map<string, UsageOverTimePoint>();

  for (const log of logs) {
    const date = new Date(log.createdAt);
    if (Number.isNaN(date.getTime())) continue;

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

  if (bucketByDate.size === 0) return [];

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

/* ─── Charts ──────────────────────────────────────────────────────────── */

function FeatureUsageChart({ items, isLoading }: { items: AdminAiUsageByFeatureItem[]; isLoading: boolean }) {
  if (isLoading) return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  if (items.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Aucune donnée d'utilisation par fonctionnalité.
      </div>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.totalRequests), 1);

  return (
    <div className="space-y-4 pt-2">
      {items.map((item) => (
        <div key={item.featureType} className="group">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-700">{item.featureType.toUpperCase()}</span>
            <span className="font-black text-slate-900">{formatNumber(item.totalRequests)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out group-hover:opacity-80"
              style={{ width: `${Math.max(6, Math.round((item.totalRequests / maxValue) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function UsageOverTimeChart({ points, isLoading }: { points: UsageOverTimePoint[]; isLoading: boolean }) {
  if (isLoading) return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
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
    <div className="space-y-3 pt-2">
      <div className="flex h-44 items-end gap-1.5 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white p-3">
        {displayed.map((point) => (
          <div key={point.date} className="group relative flex flex-1 items-end justify-center">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-purple-600 to-indigo-400 transition-opacity duration-300 group-hover:opacity-80"
              style={{ height: `${Math.max(4, Math.round((point.totalRequests / maxValue) * 100))}%` }}
            />
            <div className="pointer-events-none absolute -top-8 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
              {point.totalRequests}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span>{displayed[0]?.label}</span>
        <span>{displayed[displayed.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function UserUsageChart({
  items,
  isLoading,
  onExportUserCsv,
  onExportUserPdf,
  exportingUserCsvId,
  exportingUserPdfId,
}: {
  items: AdminAiUsageByUserItem[];
  isLoading: boolean;
  onExportUserCsv: (item: AdminAiUsageByUserItem) => void;
  onExportUserPdf: (item: AdminAiUsageByUserItem) => void;
  exportingUserCsvId: string | null;
  exportingUserPdfId: string | null;
}) {
  if (isLoading) return <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />;
  const topUsers = items.slice(0, 7);
  if (topUsers.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Aucune donnée d'utilisation par utilisateur.
      </div>
    );
  }

  const maxValue = Math.max(...topUsers.map((item) => item.totalRequests), 1);

  return (
    <div className="space-y-4 pt-1">
      {topUsers.map((item) => {
        const fullName = item.user?.fullName?.trim() || 'Utilisateur';
        const email = item.user?.email?.trim() || '-';
        return (
          <div key={item.userId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{fullName}</p>
                <p className="truncate text-[11px] text-slate-500">{email}</p>
              </div>
              <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                <p className="text-xs font-black text-slate-900">{formatNumber(item.totalRequests)}</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onExportUserCsv(item)}
                    disabled={exportingUserCsvId === item.userId}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {exportingUserCsvId === item.userId ? '...' : 'CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onExportUserPdf(item)}
                    disabled={exportingUserPdfId === item.userId}
                    className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {exportingUserPdfId === item.userId ? '...' : 'PDF'}
                  </button>
                </div>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, Math.round((item.totalRequests / maxValue) * 100))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function AdminAiMonitoringPage() {
  const [filters, setFilters] = useState<AdminAiMonitoringFilters>(DEFAULT_FILTERS);
  const [overview, setOverview] = useState<AdminAiOverview | null>(null);
  const [usageByFeature, setUsageByFeature] = useState<AdminAiUsageByFeatureItem[]>([]);
  const [usageByUser, setUsageByUser] = useState<AdminAiUsageByUserItem[]>([]);
  const [logsResult, setLogsResult] = useState<AdminAiLogsResult | null>(null);
  const [timelineLogs, setTimelineLogs] = useState<AdminAiLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isExportingLogs, setIsExportingLogs] = useState(false);
  const [isExportingLogsPdf, setIsExportingLogsPdf] = useState(false);
  const [isExportingUsageByUser, setIsExportingUsageByUser] = useState(false);
  const [isExportingUsageByUserPdf, setIsExportingUsageByUserPdf] = useState(false);
  const [exportingUserCsvId, setExportingUserCsvId] = useState<string | null>(null);
  const [exportingUserPdfId, setExportingUserPdfId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AdminAiLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const requestIdRef = useRef(0);

  const timeline = useMemo(() => buildTimelinePoints(timelineLogs, filters.dateFrom, filters.dateTo), [
    timelineLogs,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const loadMonitoringData = useCallback(async (nextFilters: AdminAiMonitoringFilters) => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const [overviewResult, featureResult, userResult, logsResultData, timelineResult] = await Promise.allSettled([
        AdminAiMonitoringService.getOverview(nextFilters),
        AdminAiMonitoringService.getUsageByFeature(nextFilters),
        AdminAiMonitoringService.getUsageByUser({ ...nextFilters, limit: 50 }),
        AdminAiMonitoringService.getLogs(nextFilters),
        AdminAiMonitoringService.getLogs({ ...nextFilters, page: 1, limit: 100 }),
      ]);

      if (currentRequestId !== requestIdRef.current) return;

      const failedSections: string[] = [];

      if (overviewResult.status === 'fulfilled') setOverview(overviewResult.value);
      else { setOverview(null); failedSections.push('overview'); }

      if (featureResult.status === 'fulfilled') setUsageByFeature(featureResult.value);
      else { setUsageByFeature([]); failedSections.push('usage by feature'); }

      if (userResult.status === 'fulfilled') setUsageByUser(userResult.value);
      else { setUsageByUser([]); failedSections.push('usage by user'); }

      if (logsResultData.status === 'fulfilled') setLogsResult(logsResultData.value);
      else { setLogsResult(null); failedSections.push('logs'); }

      if (timelineResult.status === 'fulfilled') setTimelineLogs(timelineResult.value.logs);
      else { setTimelineLogs([]); failedSections.push('usage over time'); }

      if (failedSections.length > 0) {
        toast.error(`Erreur de chargement: ${failedSections.join(', ')}`);
      }
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) return;
      toast.error(error instanceof Error ? error.message : 'Erreur réseau');
    } finally {
      if (currentRequestId === requestIdRef.current) setIsLoading(false);
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

  const handleApplyFilters = (nextFilters: AdminAiMonitoringFilters) => {
    const safeNextFilters = sanitizeFilters(nextFilters);
    setFilters((previous) => ({ ...previous, ...safeNextFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: filters.limit ?? 10 });
  };

  const handlePageChange = (nextPage: number) => {
    const totalPages = logsResult?.totalPages ?? 1;
    if (nextPage < 1 || nextPage > totalPages || isLoading) return;
    setFilters((previous) => ({ ...previous, page: nextPage }));
  };

  const handleRefresh = () => void loadMonitoringData(filters);

  /* ─── Exports ───────────────────────────────────────────────────────── */
  const handleExportLogs = async () => {
    setIsExportingLogs(true);
    try {
      await AdminAiMonitoringService.exportLogsCsv(filters);
      toast.success('Logs CSV exportés');
    } catch (error) {
      toast.error('Erreur export Logs CSV');
    } finally { setIsExportingLogs(false); }
  };

  const handleExportUsageByUser = async () => {
    setIsExportingUsageByUser(true);
    try {
      await AdminAiMonitoringService.exportUsageByUserCsv(filters);
      toast.success('Utilisateurs CSV exportés');
    } catch (error) {
      toast.error('Erreur export utilisateurs CSV');
    } finally { setIsExportingUsageByUser(false); }
  };

  const handleExportLogsPdf = async () => {
    setIsExportingLogsPdf(true);
    try {
      await AdminAiMonitoringService.exportLogsPdf(filters);
      toast.success('Logs PDF exportés');
    } catch (error) {
      toast.error('Erreur export Logs PDF');
    } finally { setIsExportingLogsPdf(false); }
  };

  const handleExportUsageByUserPdf = async () => {
    setIsExportingUsageByUserPdf(true);
    try {
      await AdminAiMonitoringService.exportUsageByUserPdf(filters);
      toast.success('Utilisateurs PDF exportés');
    } catch (error) {
      toast.error('Erreur export utilisateurs PDF');
    } finally { setIsExportingUsageByUserPdf(false); }
  };

  const handleExportSingleUserCsv = async (item: AdminAiUsageByUserItem) => {
    if (!item.userId) { toast.error('Utilisateur invalide'); return; }
    setExportingUserCsvId(item.userId);
    try {
      await AdminAiMonitoringService.exportUserLogsCsv(item.userId, filters);
      toast.success('CSV Utilisateur exporté');
    } catch (error) {
      toast.error('Erreur export CSV');
    } finally { setExportingUserCsvId(null); }
  };

  const handleExportSingleUserPdf = async (item: AdminAiUsageByUserItem) => {
    if (!item.userId) { toast.error('Utilisateur invalide'); return; }
    setExportingUserPdfId(item.userId);
    try {
      await AdminAiMonitoringService.exportUserLogsPdf(item.userId, filters);
      toast.success('PDF Utilisateur exporté');
    } catch (error) {
      toast.error('Erreur export PDF');
    } finally { setExportingUserPdfId(null); }
  };

  const handleViewDetails = async (log: AdminAiLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);
    try {
      const details = await AdminAiMonitoringService.getLogById(log.id);
      setSelectedLog(details);
    } catch (error) {
      toast.error("Erreur de chargement des détails");
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

      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
              <Zap className="w-3 h-3" />
              Centre de Contrôle
            </span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              AI Monitoring
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              Surveillance complète de l'activité, des performances et de l'utilisation des modèles d'intelligence artificielle par les utilisateurs.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualisation…' : 'Rafraîchir'}
          </button>
        </div>
      </header>

      <AiMonitoringStats overview={overview} isLoading={isLoading} />

      <AiMonitoringFilters
        filters={filters}
        isLoading={isLoading}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportLogs}
            disabled={isExportingLogs}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {isExportingLogs ? 'Export…' : 'Logs CSV'}
          </button>
          <button
            type="button"
            onClick={handleExportLogsPdf}
            disabled={isExportingLogsPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {isExportingLogsPdf ? 'Export…' : 'Logs PDF'}
          </button>
        </div>
        
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportUsageByUser}
            disabled={isExportingUsageByUser}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Users className="w-4 h-4" />
            {isExportingUsageByUser ? 'Export…' : 'Users CSV'}
          </button>
          <button
            type="button"
            onClick={handleExportUsageByUserPdf}
            disabled={isExportingUsageByUserPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Users className="w-4 h-4" />
            {isExportingUsageByUserPdf ? 'Export…' : 'Users PDF'}
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Par Fonctionnalité</h2>
              <p className="text-xs text-slate-500">Requêtes par capacité IA</p>
            </div>
          </div>
          <FeatureUsageChart items={usageByFeature} isLoading={isLoading} />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Évolution dans le temps</h2>
              <p className="text-xs text-slate-500">Tendance sur la période</p>
            </div>
          </div>
          <UsageOverTimeChart points={timeline} isLoading={isLoading} />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Par Utilisateur</h2>
              <p className="text-xs text-slate-500">Utilisateurs les plus actifs</p>
            </div>
          </div>
          <UserUsageChart
            items={usageByUser}
            isLoading={isLoading}
            onExportUserCsv={handleExportSingleUserCsv}
            onExportUserPdf={handleExportSingleUserPdf}
            exportingUserCsvId={exportingUserCsvId}
            exportingUserPdfId={exportingUserPdfId}
          />
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
