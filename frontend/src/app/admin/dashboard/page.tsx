'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import AdminService from '@/src/services/adminService';
import type { AdminUser, AdminUserStats } from '@/src/types/admin.types';

interface AdminDashboardOverview {
  stats: AdminUserStats;
  usersSample: AdminUser[];
  strategiesTotal: number;
  campaignsTotal: number;
  swotsTotal: number;
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

const EMPTY_STATS: AdminUserStats = {
  total: 0,
  admins: 0,
  banned: 0,
  recentSignups: 0,
};

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

function SignupsAreaChart({ values }: { values: number[] }) {
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
        <linearGradient id="admin-signups-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill="url(#admin-signups-fill)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="#0f766e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompositionDonut({ segments, total }: { segments: Segment[]; total: number }) {
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">users</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
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
      const [statsResult, usersResult, strategiesResult, campaignsResult, swotsResult] =
        await Promise.allSettled([
          AdminService.getStats(),
          AdminService.getUsers({ page: 1, limit: 100 }),
          AdminService.getStrategies({ page: 1, limit: 1 }),
          AdminService.getContents({ page: 1, limit: 1 }),
          AdminService.getSwots({ page: 1, limit: 1 }),
        ]);

      const stats =
        statsResult.status === 'fulfilled' ? statsResult.value : EMPTY_STATS;

      const usersSample =
        usersResult.status === 'fulfilled' ? usersResult.value.users ?? [] : [];

      const strategiesTotal =
        strategiesResult.status === 'fulfilled' ? strategiesResult.value.total ?? 0 : 0;

      const campaignsTotal =
        campaignsResult.status === 'fulfilled' ? campaignsResult.value.total ?? 0 : 0;

      const swotsTotal = swotsResult.status === 'fulfilled' ? swotsResult.value.total ?? 0 : 0;

      setOverview({
        stats,
        usersSample,
        strategiesTotal,
        campaignsTotal,
        swotsTotal,
      });
    } catch (error) {
      setOverviewError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les statistiques admin',
      );
    } finally {
      setIsOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadOverview();
  }, [isLoading, loadOverview, user]);

  const signupTrend = useMemo(() => {
    const labels: string[] = [];
    const buckets = new Map<string, number>();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      labels.push(key);
      buckets.set(key, 0);
    }

    for (const adminUser of overview?.usersSample ?? []) {
      const key = new Date(adminUser.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    return {
      labels,
      values: labels.map((label) => buckets.get(label) ?? 0),
    };
  }, [overview?.usersSample]);

  const composition = useMemo(() => {
    const totalUsers = overview?.stats.total ?? 0;
    const admins = overview?.stats.admins ?? 0;
    const banned = overview?.stats.banned ?? 0;
    const standardUsers = Math.max(totalUsers - admins, 0);
    const activeUsers = Math.max(standardUsers - banned, 0);

    const segments: Segment[] = [
      { label: 'Admins', value: admins, color: '#0ea5e9' },
      { label: 'Users actifs', value: activeUsers, color: '#22c55e' },
      { label: 'Users bannis', value: banned, color: '#f97316' },
    ].filter((segment) => segment.value > 0);

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    return { segments, total };
  }, [overview?.stats.admins, overview?.stats.banned, overview?.stats.total]);

  const adminHealthScore = useMemo(() => {
    if (!overview) return 0;

    const activeUsers = Math.max(
      (overview.stats.total - overview.stats.admins) - overview.stats.banned,
      0,
    );
    const production = overview.strategiesTotal + overview.campaignsTotal + overview.swotsTotal;

    return Math.min(
      100,
      Math.round(activeUsers * 0.2 + overview.stats.recentSignups * 3 + production * 0.08),
    );
  }, [overview]);

  const productionSeries = useMemo(() => {
    const strategies = overview?.strategiesTotal ?? 0;
    const campaigns = overview?.campaignsTotal ?? 0;
    const swots = overview?.swotsTotal ?? 0;
    const maxValue = Math.max(strategies, campaigns, swots, 1);

    return [
      {
        label: 'Strategies',
        value: strategies,
        color: 'bg-teal-500',
        width: `${Math.max(8, Math.round((strategies / maxValue) * 100))}%`,
      },
      {
        label: 'Campagnes',
        value: campaigns,
        color: 'bg-sky-500',
        width: `${Math.max(8, Math.round((campaigns / maxValue) * 100))}%`,
      },
      {
        label: 'SWOT',
        value: swots,
        color: 'bg-orange-500',
        width: `${Math.max(8, Math.round((swots / maxValue) * 100))}%`,
      },
    ];
  }, [overview?.campaignsTotal, overview?.strategiesTotal, overview?.swotsTotal]);

  const recentUsers = useMemo(
    () => (overview?.usersSample ?? []).slice(0, 6),
    [overview?.usersSample],
  );

  if (isLoading || !user) {
    return (
      <div className="px-6 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-teal-50 via-white to-orange-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-teal-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-orange-200/30 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Admin control room</p>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Bonjour, {firstName}</h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Pilotage global des utilisateurs, contenus et activite IA en temps reel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOverview()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700"
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
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Onboarding trend</p>
                  <h2 className="text-xl font-black text-slate-900">Nouveaux comptes sur 7 jours</h2>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">
                  {overview?.stats.recentSignups ?? 0} sur 30 jours
                </span>
              </div>

              <SignupsAreaChart values={signupTrend.values} />

              <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
                {signupTrend.labels.map((label, index) => (
                  <div key={label}>
                    <p>{new Date(label).toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                    <p className="text-sm text-slate-800">{signupTrend.values[index]}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Population</p>
              <h2 className="text-xl font-black text-slate-900">Composition des comptes</h2>

              <CompositionDonut segments={composition.segments} total={composition.total} />

              <div className="mt-3 space-y-2">
                {composition.segments.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucune donnee utilisateur.</p>
                ) : (
                  composition.segments.map((segment) => (
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Utilisateurs</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{overview?.stats.total ?? 0}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admins</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{overview?.stats.admins ?? 0}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comptes bannis</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{overview?.stats.banned ?? 0}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin health score</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{adminHealthScore}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-teal-500 to-orange-500"
                  style={{ width: `${adminHealthScore}%` }}
                />
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-12">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
              <h3 className="text-lg font-black text-slate-900">Production IA</h3>
              <p className="mt-1 text-sm text-slate-500">Volume global des assets generes sur la plateforme.</p>

              <div className="mt-5 space-y-4">
                {productionSeries.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
              <h3 className="text-lg font-black text-slate-900">Derniers inscrits</h3>
              <div className="mt-4 space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun utilisateur recent.</p>
                ) : (
                  recentUsers.map((adminUser) => (
                    <div key={adminUser.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{adminUser.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{adminUser.email}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {new Date(adminUser.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Gérer les utilisateurs
            </Link>
            <Link
              href="/admin/strategies"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Revue des strategies
            </Link>
            <Link
              href="/admin/content"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Revue des contenus
            </Link>
            <Link
              href="/admin/swot-analytics"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              SWOT analytics
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
