'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  User,
  BarChart2,
  Sparkles,
  PenLine,
  ChevronRight,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminSwot } from '@/src/hooks/useAdmin';
import AdminService from '@/src/services/adminService';
import { generateSwotPdf } from '@/src/lib/swotPdf';

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(date);
};

const joinList = (items?: string[]): string => {
  if (!items || items.length === 0) return '-';
  return items.join(', ');
};

/* ─── SWOT quadrant styles ────────────────────────────────────────────── */
const quadrantConfig = {
  strengths: {
    label: 'Forces',
    icon: TrendingUp,
    bg: 'bg-gradient-to-br from-emerald-50 to-white',
    border: 'border-emerald-200',
    header: 'text-emerald-700',
    headerBg: 'bg-emerald-100/60',
    itemBg: 'bg-emerald-50/80 border-emerald-100',
    dot: 'bg-emerald-400',
  },
  weaknesses: {
    label: 'Faiblesses',
    icon: TrendingDown,
    bg: 'bg-gradient-to-br from-rose-50 to-white',
    border: 'border-rose-200',
    header: 'text-rose-700',
    headerBg: 'bg-rose-100/60',
    itemBg: 'bg-rose-50/80 border-rose-100',
    dot: 'bg-rose-400',
  },
  opportunities: {
    label: 'Opportunités',
    icon: Sparkles,
    bg: 'bg-gradient-to-br from-cyan-50 to-white',
    border: 'border-cyan-200',
    header: 'text-cyan-700',
    headerBg: 'bg-cyan-100/60',
    itemBg: 'bg-cyan-50/80 border-cyan-100',
    dot: 'bg-cyan-400',
  },
  threats: {
    label: 'Menaces',
    icon: AlertTriangle,
    bg: 'bg-gradient-to-br from-amber-50 to-white',
    border: 'border-amber-200',
    header: 'text-amber-700',
    headerBg: 'bg-amber-100/60',
    itemBg: 'bg-amber-50/80 border-amber-100',
    dot: 'bg-amber-400',
  },
} as const;

type QuadrantKey = keyof typeof quadrantConfig;

const SwotQuadrant = ({ quadrantKey, items }: { quadrantKey: QuadrantKey; items?: string[] }) => {
  const config = quadrantConfig[quadrantKey];
  const Icon = config.icon;
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <article className={`rounded-2xl border ${config.border} ${config.bg} shadow-sm overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-3 ${config.headerBg} border-b ${config.border}`}>
        <Icon className={`w-4 h-4 ${config.header}`} />
        <h3 className={`text-xs font-bold uppercase tracking-widest ${config.header}`}>{config.label}</h3>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${config.header} bg-white/60`}>
          {safeItems.length}
        </span>
      </div>
      <div className="p-3 space-y-2">
        {safeItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center">Aucun élément</p>
        ) : (
          safeItems.map((item, index) => (
            <div
              key={`${quadrantKey}-${index}`}
              className={`flex items-start gap-2 rounded-xl border ${config.itemBg} px-3 py-2 text-sm text-slate-800`}
            >
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
              <span>{item}</span>
            </div>
          ))
        )}
      </div>
    </article>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function AdminSwotAnalyticsDetailPage() {
  const params = useParams();
  const swotId = params.id as string;
  const { swot, error, isLoadingSwot, loadSwot } = useAdminSwot();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!swotId) return;
    loadSwot(swotId).catch(() => undefined);
  }, [swotId, loadSwot]);

  const handleDownloadPdf = async () => {
    if (!swotId) return;
    setIsExporting(true);
    try {
      const payload = await AdminService.getSwotPdfPayload(swotId);
      generateSwotPdf(payload);
      toast.success('PDF SWOT généré avec succès');
    } catch {
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  /* ── Loading ──────────────────────────────────────────────────────── */
  if (isLoadingSwot) {
    return (
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded-full bg-slate-200" />
            <div className="h-8 w-64 rounded-xl bg-slate-200" />
            <div className="h-3 w-48 rounded bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-3 w-20 rounded bg-slate-200 mb-3" />
              <div className="h-5 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-3 w-20 rounded bg-slate-200 mb-4" />
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────── */
  if (error || !swot) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div>
            <h1 className="text-lg font-semibold text-red-800">SWOT introuvable</h1>
            <p className="mt-1 text-sm text-red-700">{error || 'Cette analyse SWOT est indisponible.'}</p>
            <Link
              href="/admin/swot-analytics"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la liste
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="relative space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Link
              href="/admin/swot-analytics"
              className="flex items-center gap-1 hover:text-purple-700 transition"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              SWOT Analytics
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 truncate max-w-[200px]">{swot.title}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                  <BarChart2 className="w-3 h-3" />
                  Analyse SWOT
                </span>
                {swot.isAiGenerated ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <Sparkles className="w-3 h-3" />
                    Généré par IA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    <PenLine className="w-3 h-3" />
                    Manuel
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{swot.title}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Créé le {formatDate(swot.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/swot-analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Génération…' : 'Télécharger PDF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Cards */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* User card */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Utilisateur</p>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{swot.user.fullName}</p>
              <p className="text-sm text-slate-500">{swot.user.email}</p>
              {swot.user.companyName && (
                <p className="mt-0.5 text-xs text-slate-400">{swot.user.companyName}</p>
              )}
            </div>
          </div>
        </article>

        {/* Strategy card */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Stratégie liée</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{swot.strategy.businessName}</p>
                <p className="text-sm text-slate-500">{swot.strategy.industry}</p>
              </div>
            </div>
            <Link
              href={`/admin/strategies/${swot.strategyId}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              Voir la stratégie
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </article>
      </section>

      {/* Inputs */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Données d'entrée</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Notes internes</p>
            <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{swot.inputs.notesInternes || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Notes externes</p>
            <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{swot.inputs.notesExternes || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Concurrents</p>
            <p className="text-sm text-slate-700">{joinList(swot.inputs.concurrents)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ressources</p>
            <p className="text-sm text-slate-700">{joinList(swot.inputs.ressources)}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Objectifs</p>
            <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{swot.inputs.objectifs || '-'}</p>
          </div>
        </div>
      </section>

      {/* SWOT Matrix */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Matrice SWOT</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SwotQuadrant quadrantKey="strengths" items={swot.swot.strengths} />
          <SwotQuadrant quadrantKey="weaknesses" items={swot.swot.weaknesses} />
          <SwotQuadrant quadrantKey="opportunities" items={swot.swot.opportunities} />
          <SwotQuadrant quadrantKey="threats" items={swot.swot.threats} />
        </div>
      </section>

      {/* Footer timestamps */}
      <footer className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Créé le {formatDate(swot.createdAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Mis à jour le {formatDate(swot.updatedAt)}
        </span>
      </footer>
    </div>
  );
}
