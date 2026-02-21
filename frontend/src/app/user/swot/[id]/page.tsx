'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import strategiesService from '@/src/services/strategiesService';
import { Strategy } from '@/src/types/strategy.types';
import { api, fetcher } from '@/src/utils/fetcher';

interface SwotInputs {
  notesInternes?: string;
  notesExternes?: string;
  concurrents?: string[];
  ressources?: string[];
  objectifs?: string;
}

interface SwotMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotDocument {
  _id: string;
  strategyId: string;
  title: string;
  inputs?: SwotInputs;
  swot: SwotMatrix;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

const stringifyList = (list?: string[]): string => (list?.length ? list.join('\n') : '');

const parseList = (value: string, max = 6): string[] =>
  value
    .split(/\n|,|;/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);

const normalizeText = (value: string): string | undefined => {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

export default function UserSwotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const swotId = params.id as string;

  const [swot, setSwot] = useState<SwotDocument | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const [title, setTitle] = useState('');
  const [notesInternes, setNotesInternes] = useState('');
  const [notesExternes, setNotesExternes] = useState('');
  const [concurrents, setConcurrents] = useState('');
  const [ressources, setRessources] = useState('');
  const [objectifs, setObjectifs] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [threats, setThreats] = useState('');
  const [improveInstruction, setImproveInstruction] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hydrateForm = (payload: SwotDocument) => {
    setTitle(payload.title || '');
    setNotesInternes(payload.inputs?.notesInternes || '');
    setNotesExternes(payload.inputs?.notesExternes || '');
    setConcurrents(stringifyList(payload.inputs?.concurrents));
    setRessources(stringifyList(payload.inputs?.ressources));
    setObjectifs(payload.inputs?.objectifs || '');
    setStrengths(stringifyList(payload.swot?.strengths));
    setWeaknesses(stringifyList(payload.swot?.weaknesses));
    setOpportunities(stringifyList(payload.swot?.opportunities));
    setThreats(stringifyList(payload.swot?.threats));
  };

  const loadSwot = async () => {
    if (!swotId) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await api.get<SwotDocument>(`/swot/${swotId}`, true);
      const payload = response.data;
      if (!payload) {
        throw new Error('SWOT introuvable');
      }

      setSwot(payload);
      hydrateForm(payload);

      try {
        const linkedStrategy = await strategiesService.getStrategy(payload.strategyId);
        setStrategy(linkedStrategy);
      } catch {
        setStrategy(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du SWOT');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSwot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swotId]);

  const parsedMatrix = useMemo<SwotMatrix>(
    () => ({
      strengths: parseList(strengths, 6),
      weaknesses: parseList(weaknesses, 6),
      opportunities: parseList(opportunities, 6),
      threats: parseList(threats, 6),
    }),
    [opportunities, strengths, threats, weaknesses],
  );

  const handleSave = async () => {
    if (!swotId) return;
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetcher<SwotDocument>(`/swot/${swotId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: normalizeText(title),
          inputs: {
            notesInternes: normalizeText(notesInternes),
            notesExternes: normalizeText(notesExternes),
            concurrents: parseList(concurrents, 20),
            ressources: parseList(ressources, 20),
            objectifs: normalizeText(objectifs),
          },
          swot: parsedMatrix,
        }),
        requireAuth: true,
      });

      if (!response.data) {
        throw new Error('Mise a jour invalide');
      }

      setSwot(response.data);
      hydrateForm(response.data);
      setSuccessMessage('SWOT mis a jour avec succes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImprove = async () => {
    if (!swotId) return;
    setIsImproving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetcher<SwotDocument>(`/swot/${swotId}/improve`, {
        method: 'POST',
        body: JSON.stringify({
          instruction: normalizeText(improveInstruction),
        }),
        requireAuth: true,
      });

      if (!response.data) {
        throw new Error('Amelioration invalide');
      }

      setSwot(response.data);
      hydrateForm(response.data);
      setSuccessMessage('SWOT ameliore par IA');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l amelioration');
    } finally {
      setIsImproving(false);
    }
  };

  const handleDelete = async () => {
    if (!swotId) return;
    if (!window.confirm('Confirmer la suppression de ce SWOT ?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      await fetcher(`/swot/${swotId}`, {
        method: 'DELETE',
        requireAuth: true,
      });
      router.push('/user/swot');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
        Chargement du SWOT...
      </div>
    );
  }

  if (!swot) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">SWOT introuvable.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/user/swot"
            className="mb-2 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour aux SWOT
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">{swot.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Strategie:{' '}
            <Link
              href={`/user/strategies/${swot.strategyId}`}
              className="font-semibold text-cyan-700 hover:underline"
            >
              {strategy?.businessInfo.businessName || swot.strategyId}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isImproving || isDeleting}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSaving || isImproving}
            className="inline-flex items-center rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Supprimer
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informations</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Titre</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes internes</label>
                <textarea
                  value={notesInternes}
                  onChange={(event) => setNotesInternes(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes externes</label>
                <textarea
                  value={notesExternes}
                  onChange={(event) => setNotesExternes(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Concurrents</label>
                <textarea
                  value={concurrents}
                  onChange={(event) => setConcurrents(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ressources</label>
                <textarea
                  value={ressources}
                  onChange={(event) => setRessources(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Objectifs</label>
                <textarea
                  value={objectifs}
                  onChange={(event) => setObjectifs(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Matrice SWOT</h2>
            <p className="mt-1 text-xs text-slate-500">1 point par ligne, maximum 6 lignes par bloc.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-emerald-700">Strengths</label>
                <textarea
                  value={strengths}
                  onChange={(event) => setStrengths(event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500 transition focus:border-emerald-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-rose-700">Weaknesses</label>
                <textarea
                  value={weaknesses}
                  onChange={(event) => setWeaknesses(event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none ring-rose-500 transition focus:border-rose-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-cyan-700">Opportunities</label>
                <textarea
                  value={opportunities}
                  onChange={(event) => setOpportunities(event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-amber-700">Threats</label>
                <textarea
                  value={threats}
                  onChange={(event) => setThreats(event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2.5 text-sm text-slate-900 outline-none ring-amber-500 transition focus:border-amber-500 focus:ring-2"
                />
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Statut</p>
            <p className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset">
              {swot.isAiGenerated ? (
                <span className="inline-flex items-center text-emerald-700 ring-emerald-200">
                  <Bot className="mr-1 h-3.5 w-3.5" />
                  Genere / ameliore par IA
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-700 ring-amber-200">
                  <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                  Saisie manuelle
                </span>
              )}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>Cree: {new Date(swot.createdAt).toLocaleDateString('fr-FR')}</p>
              <p>Maj: {new Date(swot.updatedAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              <Sparkles className="h-4 w-4" />
              Amelioration IA
            </p>
            <textarea
              value={improveInstruction}
              onChange={(event) => setImproveInstruction(event.target.value)}
              rows={4}
              placeholder="Ex: Renforce la partie opportunites sur les canaux B2B."
              className="mt-3 w-full rounded-xl border border-cyan-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
            />
            <button
              type="button"
              onClick={handleImprove}
              disabled={isImproving || isSaving || isDeleting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              Ameliorer
            </button>
          </article>

          {successMessage ? (
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </article>
          ) : null}

          {error ? (
            <article className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</article>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
