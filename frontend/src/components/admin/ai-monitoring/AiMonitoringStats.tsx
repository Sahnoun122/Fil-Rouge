"use client";

import type { AdminAiOverview } from "@/src/types/admin-ai-monitoring.types";
import { Activity, CheckCircle2, XCircle, Clock, Users } from "lucide-react";

interface AiMonitoringStatsProps {
  overview: AdminAiOverview | null;
  isLoading?: boolean;
}

interface StatCard {
  key: string;
  label: string;
  value: string;
  accentClass: string;
  icon: React.ElementType;
  iconClass: string;
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("fr-FR").format(value);
};

const formatMs = (value: number): string => {
  return `${Math.round(value)} ms`;
};

function StatsSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <article key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
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
      label: "Requêtes IA Totales",
      value: formatNumber(overview?.totalRequests ?? 0),
      accentClass: "from-purple-500 to-indigo-500",
      icon: Activity,
      iconClass: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
      key: "success",
      label: "Requêtes Réussies",
      value: formatNumber(overview?.successfulRequests ?? 0),
      accentClass: "from-emerald-400 to-emerald-600",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600 border-emerald-200",
    },
    {
      key: "failed",
      label: "Requêtes Échouées",
      value: formatNumber(overview?.failedRequests ?? 0),
      accentClass: "from-rose-400 to-rose-600",
      icon: XCircle,
      iconClass: "bg-rose-100 text-rose-600 border-rose-200",
    },
    {
      key: "response",
      label: "Temps de Réponse Moyen",
      value: formatMs(overview?.averageResponseTimeMs ?? 0),
      accentClass: "from-amber-400 to-orange-500",
      icon: Clock,
      iconClass: "bg-amber-100 text-amber-600 border-amber-200",
    },
    {
      key: "users",
      label: "Utilisateurs Actifs (IA)",
      value: formatNumber(overview?.uniqueUsers ?? 0),
      accentClass: "from-indigo-400 to-violet-600",
      icon: Users,
      iconClass: "bg-indigo-100 text-indigo-600 border-indigo-200",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <article 
            key={item.key} 
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-purple-200"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight flex-1">
                  {item.label}
                </p>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
            </div>
            
            {/* Subtle bottom gradient bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accentClass} opacity-80 transition-all duration-300 group-hover:h-1.5`} />
            
            {/* Decorative background blur */}
            <div className={`pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${item.accentClass} opacity-[0.03] blur-xl transition duration-500 group-hover:opacity-[0.08]`} />
          </article>
        );
      })}
    </section>
  );
}
