"use client";

import type { AdminAiOverview } from "@/src/types/admin-ai-monitoring.types";

interface AiMonitoringStatsProps {
  overview: AdminAiOverview | null;
  isLoading?: boolean;
}

interface StatCard {
  key: string;
  label: string;
  value: string;
  accentClass: string;
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

const formatMs = (value: number): string => {
  return `${Math.round(value)} ms`;
};

function StatsSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <article key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-2 w-full animate-pulse rounded bg-slate-100" />
        </article>
      ))}
    </section>
  );
}

export default function AiMonitoringStats({ overview, isLoading = false }: AiMonitoringStatsProps) {
  if (isLoading) {
    return <StatsSkeleton />;
  }

  const stats: StatCard[] = [
    {
      key: "total",
      label: "Total AI Requests",
      value: formatNumber(overview?.totalRequests ?? 0),
      accentClass: "from-cyan-500 to-blue-500",
    },
    {
      key: "success",
      label: "Successful Requests",
      value: formatNumber(overview?.successfulRequests ?? 0),
      accentClass: "from-emerald-500 to-green-500",
    },
    {
      key: "failed",
      label: "Failed Requests",
      value: formatNumber(overview?.failedRequests ?? 0),
      accentClass: "from-rose-500 to-red-500",
    },
    {
      key: "response",
      label: "Average Response Time",
      value: formatMs(overview?.averageResponseTimeMs ?? 0),
      accentClass: "from-amber-500 to-orange-500",
    },
    {
      key: "users",
      label: "Active AI Users",
      value: formatNumber(overview?.uniqueUsers ?? 0),
      accentClass: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((item) => (
        <article key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
          <div className={`mt-4 h-1.5 rounded-full bg-linear-to-r ${item.accentClass}`} />
        </article>
      ))}
    </section>
  );
}
