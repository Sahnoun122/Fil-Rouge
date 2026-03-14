'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Shield, Ban, TrendingUp, Target, BarChart3, FileText, RefreshCw, ArrowRight } from 'lucide-react';
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
      <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 lg:col-span-8" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-100 lg:col-span-4" />
      </div>
    </div>
  );
}

function SignupsAreaChart({ values }: { values: number[] }) {
  const maxValue = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * 100;
      const y = 100 - (v / maxValue) * 78 - 8;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 100" className="h-44 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="admin-area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill="url(#admin-area-fill)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="#6d28d9"
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
    (acc, seg) => {
      const length = total > 0 ? (seg.value / total) * circumference : 0;
      return {
        offset: acc.offset + length,
        items: [
          ...acc.items,
          {
            label: seg.label,
            color: seg.color,
            dasharray: `${length} ${circumference}`,
            dashoffset: -acc.offset,
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
        {circles.map((c) => (
          <circle
            key={c.label}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={c.color}
            strokeWidth="12"
            strokeDasharray={c.dasharray}
            strokeDashoffset={c.dashoffset}
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

      setOverview({
        stats: statsResult.status === 'fulfilled' ? statsResult.value : EMPTY_STATS,
        usersSample: usersResult.status === 'fulfilled' ? usersResult.value.users ?? [] : [],
        strategiesTotal: strategiesResult.status === 'fulfilled' ? strategiesResult.value.total ?? 0 : 0,
        campaignsTotal: campaignsResult.status === 'fulfilled' ? campaignsResult.value.total ?? 0 : 0,
        swotsTotal: swotsResult.status === 'fulfilled' ? swotsResult.value.total ?? 0 : 0,
      });
    } catch (error) {
      setOverviewError(
        error instanceof Error ? error.message : 'Impossible de charger les statistiques admin',
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
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      buckets.set(key, 0);
    }
    for (const u of overview?.usersSample ?? []) {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return { labels, values: labels.map((l) => buckets.get(l) ?? 0) };
  }, [overview?.usersSample]);

  const composition = useMemo(() => {
    const totalUsers = overview?.stats.total ?? 0;
    const admins = overview?.stats.admins ?? 0;
    const banned = overview?.stats.banned ?? 0;
    const standardUsers = Math.max(totalUsers - admins, 0);
    const activeUsers = Math.max(standardUsers - banned, 0);
    const segments: Segment[] = [
      { label: 'Admins', value: admins, color: '#7c3aed' },
      { label: 'Actifs', value: activeUsers, color: '#22c55e' },
      { label: 'Bannis', value: banned, color: '#f97316' },
    ].filter((s) => s.value > 0);
    return { segments, total: segments.reduce((s, seg) => s + seg.value, 0) };
  }, [overview?.stats]);

  const adminHealthScore = useMemo(() => {
    if (!overview) return 0;
    const activeUsers = Math.max(
      overview.stats.total - overview.stats.admins - overview.stats.banned,
      0,
    );
    const production = overview.strategiesTotal + overview.campaignsTotal + overview.swotsTotal;
    return Math.min(100, Math.round(activeUsers * 0.2 + overview.stats.recentSignups * 3 + production * 0.08));
  }, [overview]);

  const productionSeries = useMemo(() => {
    const strategies = overview?.strategiesTotal ?? 0;
    const campaigns = overview?.campaignsTotal ?? 0;
    const swots = overview?.swotsTotal ?? 0;
    const maxValue = Math.max(strategies, campaigns, swots, 1);
    return [
      { label: 'Stratégies', value: strategies, color: 'from-violet-500 to-purple-500', width: `${Math.max(8, Math.round((strategies / maxValue) * 100))}%` },
      { label: 'Campagnes', value: campaigns, color: 'from-purple-500 to-indigo-500', width: `${Math.max(8, Math.round((campaigns / maxValue) * 100))}%` },
      { label: 'SWOT', value: swots, color: 'from-indigo-400 to-violet-400', width: `${Math.max(8, Math.round((swots / maxValue) * 100))}%` },
    ];
  }, [overview]);

  const recentUsers = useMemo(() => (overview?.usersSample ?? []).slice(0, 6), [overview?.usersSample]);

  const statCards = useMemo(() => [
    {
      label: 'Total utilisateurs',
      value: overview?.stats.total ?? 0,
      icon: Users,
      accent: 'bg-violet-50 text-violet-600 border-violet-100',
      bar: 'from-violet-500 to-purple-500',
    },
    {
      label: 'Admins',
      value: overview?.stats.admins ?? 0,
      icon: Shield,
      accent: 'bg-purple-50 text-purple-600 border-purple-100',
      bar: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Bannis',
      value: overview?.stats.banned ?? 0,
      icon: Ban,
      accent: 'bg-orange-50 text-orange-600 border-orange-100',
      bar: 'from-orange-500 to-amber-500',
    },
    {
      label: 'Health score',
      value: `${adminHealthScore}%`,
      icon: TrendingUp,
      accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      bar: 'from-emerald-500 to-teal-500',
      isScore: true,
      score: adminHealthScore,
    },
  ], [overview?.stats, adminHealthScore]);

  const quickActions = useMemo(() => [
    { label: 'Gérer les utilisateurs', href: '/admin/users', icon: Users, color: 'violet' },
    { label: 'Revue des stratégies', href: '/admin/strategies', icon: Target, color: 'purple' },
    { label: 'Revue des contenus', href: '/admin/content', icon: FileText, color: 'indigo' },
    { label: 'SWOT analytics', href: '/admin/swot-analytics', icon: BarChart3, color: 'sky' },
  ], []);

  const colorMap: Record<string, string> = {
    violet: 'border-violet-100 hover:border-violet-300 hover:bg-violet-50/60 text-violet-700',
    purple: 'border-purple-100 hover:border-purple-300 hover:bg-purple-50/60 text-purple-700',
    indigo: 'border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/60 text-indigo-700',
    sky: 'border-sky-100 hover:border-sky-300 hover:bg-sky-50/60 text-sky-700',
  };

  if (isLoading || !user) {
    return <div className="px-6 py-8"><DashboardSkeleton /></div>;
  }

  return (
    <div className="space-y-7">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-purple-200/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/3 h-32 w-32 rounded-full bg-indigo-200/20 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                <Shield className="w-3 h-3" />
                Admin Control Room
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Bonjour, {firstName} 👋
            </h1>
            <p className="max-w-xl text-sm text-slate-500 sm:text-base">
              Pilotage global des utilisateurs, contenus et activité IA en temps réel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOverview()}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 hover:shadow active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
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

          {/* Stat cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.label}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                      <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${card.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  {'isScore' in card && card.isScore && (
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${card.bar} transition-all duration-700`}
                        style={{ width: `${card.score}%` }}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {/* Charts row */}
          <section className="grid gap-4 lg:grid-cols-12">
            {/* Area chart */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Onboarding trend</p>
                  <h2 className="text-xl font-black text-slate-900">Nouveaux comptes — 7 jours</h2>
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 border border-violet-100">
                  {overview?.stats.recentSignups ?? 0} sur 30j
                </span>
              </div>

              <SignupsAreaChart values={signupTrend.values} />

              <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
                {signupTrend.labels.map((label, i) => (
                  <div key={label}>
                    <p>{new Date(label).toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                    <p className="text-sm text-slate-800">{signupTrend.values[i]}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* Donut */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Population</p>
              <h2 className="text-xl font-black text-slate-900">Composition</h2>

              <div className="mt-4">
                <CompositionDonut segments={composition.segments} total={composition.total} />
              </div>

              <div className="mt-4 space-y-2">
                {composition.segments.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucune donnée utilisateur.</p>
                ) : (
                  composition.segments.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="font-medium text-slate-700">{seg.label}</span>
                      </div>
                      <span className="font-bold text-slate-900">{seg.value}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          {/* Production + Recent users */}
          <section className="grid gap-4 lg:grid-cols-12">
            {/* Production bars */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
              <h3 className="text-lg font-black text-slate-900">Production IA</h3>
              <p className="mt-1 text-sm text-slate-500">Volume global des assets générés sur la plateforme.</p>

              <div className="mt-5 space-y-5">
                {productionSeries.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Recent users */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Derniers inscrits</h3>
                <Link
                  href="/admin/users"
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="mt-4 space-y-2.5">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun utilisateur récent.</p>
                ) : (
                  recentUsers.map((u) => {
                    const ini = u.fullName
                      ? u.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'U';
                    return (
                      <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-violet-100 hover:bg-violet-50/40">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {ini}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{u.fullName}</p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>

          {/* Quick action cards */}
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 ${colorMap[action.color]}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
