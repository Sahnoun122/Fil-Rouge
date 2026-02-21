'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Bot, Loader2, PencilLine, Sparkles } from 'lucide-react';
import strategiesService from '@/src/services/strategiesService';
import { Strategy } from '@/src/types/strategy.types';
import { fetcher } from '@/src/utils/fetcher';

type FormMode = 'manual' | 'ai';

interface SwotMatrixPayload {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotInputsPayload {
  notesInternes?: string;
  notesExternes?: string;
  concurrents?: string[];
  ressources?: string[];
  objectifs?: string;
}

interface SwotDocument {
  _id: string;
}

const splitList = (value: string, max = 6): string[] =>
  value
    .split(/\n|,|;/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);

const keepIfFilled = (value: string): string | undefined => {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

export default function UserNewSwotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<FormMode>('ai');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState('');
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');

  const [notesInternes, setNotesInternes] = useState('');
  const [notesExternes, setNotesExternes] = useState('');
  const [concurrents, setConcurrents] = useState('');
  const [ressources, setRessources] = useState('');
  const [objectifs, setObjectifs] = useState('');

  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [threats, setThreats] = useState('');

  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStrategies = async () => {
      setIsLoadingStrategies(true);
      setError(null);
      try {
        const response = await strategiesService.getAllStrategies(1, 50);
        setStrategies(response.strategies ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les strategies');
      } finally {
        setIsLoadingStrategies(false);
      }
    };

    void loadStrategies();
  }, []);

  useEffect(() => {
    const queryStrategyId = searchParams.get('strategyId');
    if (queryStrategyId) {
      setSelectedStrategyId(queryStrategyId);
    }
  }, [searchParams]);

  const selectedStrategy = useMemo(
    () => strategies.find((item) => item._id === selectedStrategyId),
    [selectedStrategyId, strategies],
  );

  const buildInputsPayload = (): SwotInputsPayload => {
    const payload: SwotInputsPayload = {
      notesInternes: keepIfFilled(notesInternes),
      notesExternes: keepIfFilled(notesExternes),
      concurrents: splitList(concurrents, 20),
      ressources: splitList(ressources, 20),
      objectifs: keepIfFilled(objectifs),
    };

    if (!payload.concurrents?.length) delete payload.concurrents;
    if (!payload.ressources?.length) delete payload.ressources;
    if (!payload.notesInternes) delete payload.notesInternes;
    if (!payload.notesExternes) delete payload.notesExternes;
    if (!payload.objectifs) delete payload.objectifs;

    return payload;
  };

  const buildSwotPayload = (): SwotMatrixPayload => ({
    strengths: splitList(strengths, 6),
    weaknesses: splitList(weaknesses, 6),
    opportunities: splitList(opportunities, 6),
    threats: splitList(threats, 6),
  });

  const handleSubmit = async () => {
    if (!selectedStrategyId) {
      setError('Selectionnez une strategie avant de continuer');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const inputsPayload = buildInputsPayload();

    try {
      if (mode === 'manual') {
        const response = await fetcher<SwotDocument>('/swot/manual', {
          method: 'POST',
          body: JSON.stringify({
            strategyId: selectedStrategyId,
            title: keepIfFilled(title),
            inputs: inputsPayload,
            swot: buildSwotPayload(),
          }),
          requireAuth: true,
        });

        const swotId = response.data?._id;
        router.push(swotId ? `/user/swot/${swotId}` : '/user/swot');
        return;
      }

      const response = await fetcher<SwotDocument>('/swot/generate', {
        method: 'POST',
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          inputs: inputsPayload,
          instruction: keepIfFilled(instruction),
        }),
        requireAuth: true,
      });

      const swotId = response.data?._id;
      router.push(swotId ? `/user/swot/${swotId}` : '/user/swot');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation du SWOT');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/user/swot"
            className="mb-3 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour aux SWOT
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Creer un SWOT</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choisissez une strategie, ajoutez votre contexte, puis creez une analyse manuelle ou assistee par IA.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'ai'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bot className="mr-2 h-4 w-4" />
            Generer avec IA
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'manual'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Saisie manuelle
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Contexte</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Strategie liee *</label>
                <select
                  value={selectedStrategyId}
                  onChange={(event) => setSelectedStrategyId(event.target.value)}
                  disabled={isLoadingStrategies}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">{isLoadingStrategies ? 'Chargement...' : 'Selectionnez une strategie'}</option>
                  {strategies.map((strategy) => (
                    <option key={strategy._id} value={strategy._id}>
                      {strategy.businessInfo.businessName} - {strategy.businessInfo.industry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Titre (optionnel)</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: SWOT - Maison Elegance"
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
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Concurrents (virgule ou retour ligne)
                </label>
                <textarea
                  value={concurrents}
                  onChange={(event) => setConcurrents(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ressources (virgule ou retour ligne)
                </label>
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

          {mode === 'manual' ? (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Matrice SWOT (manuel)</h2>
              <p className="mt-1 text-xs text-slate-500">1 point par ligne, maximum 6 points par categorie.</p>
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
          ) : (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Brief de generation IA</h2>
              <p className="mt-1 text-sm text-slate-600">Orientez l&apos;analyse avec une instruction ciblee.</p>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Instruction (optionnel)
                </label>
                <textarea
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  rows={4}
                  placeholder="Ex: Focus sur la croissance e-commerce et la differenciation locale."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                />
              </div>
            </article>
          )}
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Recapitulatif</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>
                Mode: <span className="font-semibold text-slate-900">{mode === 'ai' ? 'IA' : 'Manuel'}</span>
              </li>
              <li>
                Strategie:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedStrategy?.businessInfo.businessName || 'Non selectionnee'}
                </span>
              </li>
              <li>
                Secteur:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedStrategy?.businessInfo.industry || '-'}
                </span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
              <Sparkles className="h-4 w-4" />
              Conseils
            </p>
            <ul className="mt-3 space-y-2 text-sm text-cyan-900">
              <li>Appuyez-vous sur des faits de marche recents.</li>
              <li>Evitez les formulations trop generales.</li>
              <li>Pensez en actions concretes et prioritaires.</li>
            </ul>
          </article>

          {error ? (
            <article className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </article>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingStrategies}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creation...
              </>
            ) : (
              <>Valider le SWOT</>
            )}
          </button>
        </aside>
      </section>
    </div>
  );
}
