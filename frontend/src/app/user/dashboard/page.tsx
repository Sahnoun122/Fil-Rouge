'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { calendarService } from '@/src/services/calendarService';
import { contentService } from '@/src/services/contentService';
import { notificationsService } from '@/src/services/notificationsService';
import { strategiesService } from '@/src/services/strategiesService';
import type { ScheduledPost } from '@/src/types/calendar.types';
import { BarChart2, BellDot, CalendarDays, Layers, RefreshCw, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

interface DashboardOverview {
  strategiesTotal: number;
  campaignsTotal: number;
  upcomingPostsTotal: number;
  unreadNotifications: number;
  nextPost: ScheduledPost | null;
  upcomingPosts: ScheduledPost[];
}

interface PlatformSegment {
  label: string;
  value: number;
  color: string;
}

const PLATFORM_COLORS = ['#14b8a6', '#0ea5e9', '#f97316', '#8b5cf6', '#ef4444', '#22c55e'];

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-72 rounded-2xl bg-slate-100 lg:col-span-8" />
        <div className="h-72 rounded-2xl bg-slate-100 lg:col-span-4" />
      </div>
    </div>
  );
}

function AreaTrendChart({ values }: { values: number[] }) {
  const maxValue = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100;
      const y = 100 - (value / maxValue) * 78 - 8;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 100" className="h-44 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill="url(#trend-fill)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DonutChart({ segments, total }: { segments: PlatformSegment[]; total: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const circles = segments.reduce<{
    offset: number;
    items: Array<{ label: string; color: string; dasharray: string; dashoffset: number }>;
  }>(
    (accumulator, segment) => {
      const length = total > 0 ? (segment.value / total) * circumference : 0;
      return {
        offset: accumulator.offset + length,
        items: [
          ...accumulator.items,
          {
            label: segment.label,
            color: segment.color,
            dasharray: `${length} ${circumference}`,
            dashoffset: -accumulator.offset,
          },
        ],
      };
    },
    { offset: 0, items: [] },
  ).items;

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={radius} stroke="#f1f5f9" strokeWidth="12" fill="none" />
        {circles.map((circle) => (
          <circle
            key={circle.label}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={circle.color}
            strokeWidth="12"
            strokeDasharray={circle.dasharray}
            strokeDashoffset={circle.dashoffset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-black text-slate-900">{total}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">posts</p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  extra?: React.ReactNode;
}

function StatCard({ icon, label, value, iconBg, iconColor, extra }: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-300/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      {extra && <div className="mt-3">{extra}</div>}
    </article>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const firstName = useMemo(() => {
    if (!user) return '';
    return user.fullName.split(' ')[0] || user.fullName;
  }, [user]);

  const loadOverview = useCallback(async () => {
    setIsOverviewLoading(true);
    setOverviewError(null);

    try {
      const now = new Date();
      const rangeEnd = new Date(now);
      rangeEnd.setDate(rangeEnd.getDate() + 90);

      const [strategiesResult, campaignsResult, calendarResult, notificationsResult] =
        await Promise.allSettled([
          strategiesService.getAllStrategies(1, 1),
          contentService.listCampaigns(1, 1),
          calendarService.listPosts({
            rangeStart: now.toISOString(),
            rangeEnd: rangeEnd.toISOString(),
            status: 'planned',
            page: 1,
            limit: 100,
          }),
          notificationsService.listNotifications(),
        ]);

      const strategiesTotal =
        strategiesResult.status === 'fulfilled'
          ? strategiesResult.value.pagination?.total ?? strategiesResult.value.strategies?.length ?? 0
          : 0;

      const campaignsTotal =
        campaignsResult.status === 'fulfilled'
          ? campaignsResult.value.pagination?.total ?? campaignsResult.value.campaigns?.length ?? 0
          : 0;

      const upcomingPosts =
        calendarResult.status === 'fulfilled'
          ? [...(calendarResult.value.posts ?? [])].sort(
              (left, right) =>
                new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime(),
            )
          : [];

      const upcomingPostsTotal =
        calendarResult.status === 'fulfilled' ? calendarResult.value.total ?? upcomingPosts.length : 0;

      const unreadNotifications =
        notificationsResult.status === 'fulfilled'
          ? notificationsResult.value.filter((notification) => !notification.isRead).length
          : 0;

      setOverview({
        strategiesTotal,
        campaignsTotal,
        upcomingPostsTotal,
        unreadNotifications,
        nextPost: upcomingPosts[0] ?? null,
        upcomingPosts,
      });
    } catch (error) {
      setOverviewError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les statistiques du dashboard',
      );
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadOverview();
  }, [isLoading, loadOverview, user]);

  const weeklyTrend = useMemo(() => {
    const bins = [0, 0, 0, 0, 0, 0];
    const now = Date.now();

    for (const post of overview?.upcomingPosts ?? []) {
      const diffDays = Math.floor((new Date(post.scheduledAt).getTime() - now) / 86400000);
      if (diffDays < 0) continue;
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < bins.length) {
        bins[weekIndex] += 1;
      }
    }

    return bins;
  }, [overview?.upcomingPosts]);

  const platformSegments = useMemo<PlatformSegment[]>(() => {
    const counts = new Map<string, number>();

    for (const post of overview?.upcomingPosts ?? []) {
      counts.set(post.platform, (counts.get(post.platform) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        label,
        value,
        color: PLATFORM_COLORS[index % PLATFORM_COLORS.length],
      }));
  }, [overview?.upcomingPosts]);

  const totalSegmentPosts = useMemo(
    () => platformSegments.reduce((sum, segment) => sum + segment.value, 0),
    [platformSegments],
  );

  const focusScore = useMemo(() => {
    if (!overview) return 0;
    return Math.min(
      100,
      overview.strategiesTotal * 12 + overview.campaignsTotal * 8 + overview.upcomingPostsTotal * 2,
    );
  }, [overview]);

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-violet-100 bg-linear-to-br from-violet-600 via-purple-600 to-violet-700 p-6 shadow-lg shadow-violet-500/20 text-white">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-28 top-4 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-200 mb-1">Creator Cockpit</p>
              <h1 className="text-2xl font-black text-white sm:text-3xl">Bonjour, {firstName} ðŸ‘‹</h1>
              <p className="mt-0.5 text-sm text-violet-200">
                Suivez votre rythme de publication et gardez un planning rÃ©gulier.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadOverview()}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:block">RafraÃ®chir</span>
          </button>
        </div>
      </section>

      {isOverviewLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {overviewError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              {overviewError}
            </div>
          )}

          {/* Stat cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="StratÃ©gies"
              value={overview?.strategiesTotal ?? 0}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <StatCard
              icon={<Layers className="h-5 w-5" />}
              label="Campagnes"
              value={overview?.campaignsTotal ?? 0}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-600"
            />
            <StatCard
              icon={<BellDot className="h-5 w-5" />}
              label="Notifications non lues"
              value={overview?.unreadNotifications ?? 0}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Focus score"
              value={`${focusScore}%`}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              extra={
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                    style={{ width: `${focusScore}%` }}
                  />
                </div>
              }
            />
          </section>

          {/* Charts row */}
          <section className="grid gap-4 lg:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-8">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart2 className="h-4 w-4 text-violet-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Publishing Momentum</p>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Tendance des 6 prochaines semaines</h2>
                </div>
                <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                  {overview?.upcomingPostsTotal ?? 0} posts Ã  venir
                </span>
              </div>

              <AreaTrendChart values={weeklyTrend} />

              <div className="mt-3 grid grid-cols-6 gap-2 border-t border-slate-100 pt-3 text-center text-xs text-slate-500">
                {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((label, index) => (
                  <div key={label} className="space-y-0.5">
                    <p className="font-medium text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{weeklyTrend[index]}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-4">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Platform Mix</p>
                <h2 className="text-lg font-bold text-slate-900">RÃ©partition des posts</h2>
              </div>

              <DonutChart segments={platformSegments} total={totalSegmentPosts} />

              <div className="mt-4 space-y-2">
                {platformSegments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-sm text-slate-400">
                    Aucune donnÃ©e pour le moment.
                  </div>
                ) : (
                  platformSegments.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-medium capitalize text-slate-700">{segment.label}</span>
                      </div>
                      <span className="font-bold text-slate-900">{segment.value}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          {/* Bottom row */}
          <section className="grid gap-4 lg:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <h3 className="text-base font-bold text-slate-900">Prochaine publication</h3>
                </div>
                <Link href="/user/calendar" className="text-xs font-semibold text-violet-600 transition hover:text-violet-800 hover:underline">
                  Voir tout â†’
                </Link>
              </div>

              {overview?.nextPost ? (
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200">
                  <p className="text-sm font-bold text-slate-900">
                    {overview.nextPost.title?.trim() || 'Publication sans titre'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-semibold text-violet-700">
                      {overview.nextPost.platform.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-semibold text-orange-700">
                      {overview.nextPost.postType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    ðŸ“… {new Date(overview.nextPost.scheduledAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                  <CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">Aucun post planifiÃ© dans les prochaines semaines.</p>
                  <Link href="/user/calendar/new" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline">
                    Planifier un post â†’
                  </Link>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:col-span-5">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">Actions rapides</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { label: 'âœ¦ Nouvelle stratÃ©gie', href: '/user/strategies/new', color: 'hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700' },
                  { label: 'âœ¦ Nouvelle campagne', href: '/user/content/new', color: 'hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700' },
                  { label: 'âœ¦ Planifier un post', href: '/user/calendar/new', color: 'hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700' },
                  { label: 'âœ¦ Ouvrir contenu', href: '/user/content', color: 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700' },
                ].map(({ label, href, color }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 transition-all duration-150 ${color} active:scale-95`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
