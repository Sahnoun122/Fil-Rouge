'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Building2, Calendar, User } from 'lucide-react';
import { useAdminSwot } from '@/src/hooks/useAdmin';

const formatDate = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const joinList = (items?: string[]): string => {
  if (!items || items.length === 0) {
    return '-';
  }
  return items.join(', ');
};

const renderMatrixList = (items?: string[]) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">Aucun point</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="rounded-lg bg-white/70 px-2.5 py-2 text-sm text-slate-800">
          {item}
        </li>
      ))}
    </ul>
  );
};

export default function AdminSwotAnalyticsDetailPage() {
  const params = useParams();
  const swotId = params.id as string;
  const { swot, error, isLoadingSwot, loadSwot } = useAdminSwot();

  useEffect(() => {
    if (!swotId) {
      return;
    }
    loadSwot(swotId).catch(() => undefined);
  }, [swotId, loadSwot]);

  if (isLoadingSwot) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Chargement du SWOT...</p>
      </section>
    );
  }

  if (error || !swot) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <h1 className="text-lg font-semibold text-red-800">SWOT introuvable</h1>
            <p className="mt-1 text-sm text-red-700">{error || 'Ce SWOT est indisponible.'}</p>
            <Link
              href="/admin/swot-analytics"
              className="mt-4 inline-flex items-center rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour a la liste
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/swot-analytics"
              className="mb-2 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Retour aux SWOT analytics
            </Link>
            <h1 className="text-2xl font-semibold text-slate-900">{swot.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Cree le {formatDate(swot.createdAt)} | Mis a jour le {formatDate(swot.updatedAt)}
            </p>
          </div>

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              swot.isAiGenerated ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {swot.isAiGenerated ? 'SWOT IA' : 'SWOT Manuel'}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Utilisateur</p>
          <p className="mt-3 flex items-center text-sm font-medium text-slate-900">
            <User className="mr-2 h-4 w-4 text-slate-500" />
            {swot.user.fullName}
          </p>
          <p className="mt-1 text-sm text-slate-600">{swot.user.email}</p>
          <p className="mt-1 text-sm text-slate-600">{swot.user.companyName || 'Sans entreprise'}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Strategie liee</p>
          <p className="mt-3 flex items-center text-sm font-medium text-slate-900">
            <Building2 className="mr-2 h-4 w-4 text-slate-500" />
            {swot.strategy.businessName}
          </p>
          <p className="mt-1 text-sm text-slate-600">{swot.strategy.industry}</p>
          <Link
            href={`/admin/strategies/${swot.strategyId}`}
            className="mt-3 inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Voir la strategie
          </Link>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Inputs</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">Notes internes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{swot.inputs.notesInternes || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Notes externes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{swot.inputs.notesExternes || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Concurrents</p>
            <p className="mt-1 text-sm text-slate-600">{joinList(swot.inputs.concurrents)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Ressources</p>
            <p className="mt-1 text-sm text-slate-600">{joinList(swot.inputs.ressources)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Objectifs</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{swot.inputs.objectifs || '-'}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Strengths</p>
          {renderMatrixList(swot.swot.strengths)}
        </article>
        <article className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-rose-700">Weaknesses</p>
          {renderMatrixList(swot.swot.weaknesses)}
        </article>
        <article className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">Opportunities</p>
          {renderMatrixList(swot.swot.opportunities)}
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-amber-700">Threats</p>
          {renderMatrixList(swot.swot.threats)}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center text-sm text-slate-600">
          <Calendar className="mr-2 h-4 w-4" />
          Cree le {formatDate(swot.createdAt)} | Mis a jour le {formatDate(swot.updatedAt)}
        </p>
      </section>
    </div>
  );
}
