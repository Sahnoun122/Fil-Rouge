'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { calendarService } from '@/src/services/calendarService';
import { contentService } from '@/src/services/contentService';
import { notificationsService } from '@/src/services/notificationsService';
import { strategiesService } from '@/src/services/strategiesService';
import type { ScheduledPost } from '@/src/types/calendar.types';

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
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-3xl bg-slate-200" />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 lg:col-span-8" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-100 lg:col-span-4" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        ))}
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
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        points={areaPoints}
        fill="url(#trend-fill)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#0284c7"
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
        <circle cx="60" cy="60" r={radius} stroke="#e2e8f0" strokeWidth="12" fill="none" />
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
    return (
      <div className="px-6 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-cyan-50 via-white to-orange-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-orange-200/30 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">Creator cockpit</p>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Bonjour, {firstName}</h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Un dashboard visuel pour suivre votre rythme de publication et garder un planning regulier.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOverview()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
          >
            Rafraichir
          </button>
        </div>
      </section>

      {isOverviewLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {overviewError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {overviewError}
            </div>
          )}

          <section className="grid gap-4 lg:grid-cols-12">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publishing momentum</p>
                  <h2 className="text-xl font-black text-slate-900">Tendance des 6 prochaines semaines</h2>
                </div>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                  {overview?.upcomingPostsTotal ?? 0} posts a venir
                </span>
              </div>

              <AreaTrendChart values={weeklyTrend} />

              <div className="mt-3 grid grid-cols-6 gap-2 text-center text-xs font-semibold text-slate-500">
                {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((label, index) => (
                  <div key={label}>
                    <p>{label}</p>
                    <p className="text-sm text-slate-800">{weeklyTrend[index]}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Platform mix</p>
              <h2 className="text-xl font-black text-slate-900">Repartition des posts</h2>

              <DonutChart segments={platformSegments} total={totalSegmentPosts} />

              <div className="mt-3 space-y-2">
                {platformSegments.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucune donnee pour le moment.</p>
                ) : (
                  platformSegments.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-medium text-slate-700">{segment.label}</span>
                      </div>
                      <span className="font-bold text-slate-900">{segment.value}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Strategies</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{overview?.strategiesTotal ?? 0}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Campagnes</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{overview?.campaignsTotal ?? 0}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notifications non lues</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{overview?.unreadNotifications ?? 0}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Focus score</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{focusScore}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-500 to-orange-500"
                  style={{ width: `${focusScore}%` }}
                />
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-12">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Prochaine publication</h3>
                <Link href="/user/calendar" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                  Voir tout
                </Link>
              </div>

              {overview?.nextPost ? (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-base font-bold text-slate-900">
                    {overview.nextPost.title?.trim() || 'Publication sans titre'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-700">
                      {overview.nextPost.platform.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                      {overview.nextPost.postType}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {new Date(overview.nextPost.scheduledAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucun post planifie dans les prochaines semaines.</p>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
              <h3 className="text-lg font-black text-slate-900">Actions rapides</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/user/strategies/new"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Nouvelle strategie
                </Link>
                <Link
                  href="/user/content/new"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Nouvelle campagne
                </Link>
                <Link
                  href="/user/calendar/new"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Planifier un post
                </Link>
                <Link
                  href="/user/content"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Ouvrir contenu
                </Link>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
