'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  Loader2,
  PenSquare,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { fetcher } from '@/src/utils/fetcher';
import { generateSwotPdf } from '@/src/lib/swotPdf';
import type { SwotPdfExportPayload } from '@/src/types/swot.types';

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

interface SwotDetail {
  _id: string;
  strategyId: string;
  title: string;
  inputs: SwotInputs;
  swot: SwotMatrix;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Strategy {
  _id: string;
  businessInfo: {
    businessName: string;
    mainObjective?: string;
    tone?: string;
  };
}

interface SwotForm {
  title: string;
  inputs: {
    notesInternes: string;
    notesExternes: string;
    concurrents: string[];
    ressources: string[];
    objectifs: string;
  };
  matrix: SwotMatrix;
}

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const parseList = (value: string, maxItems = 20): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxItems);

const stringifyList = (items: string[] | undefined): string =>
  (items ?? []).join('\n');

function swotToForm(swot: SwotDetail): SwotForm {
  return {
    title: swot.title,
    inputs: {
      notesInternes: swot.inputs?.notesInternes ?? '',
      notesExternes: swot.inputs?.notesExternes ?? '',
      concurrents: swot.inputs?.concurrents ?? [],
      ressources: swot.inputs?.ressources ?? [],
      objectifs: swot.inputs?.objectifs ?? '',
    },
    matrix: {
      strengths: swot.swot?.strengths ?? [],
      weaknesses: swot.swot?.weaknesses ?? [],
      opportunities: swot.swot?.opportunities ?? [],
      threats: swot.swot?.threats ?? [],
    },
  };
}

export default function SwotDetailPage() {
  const params = useParams<{ id: string }>();
  const swotId = params?.id;

  const [swot, setSwot] = useState<SwotDetail | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [form, setForm] = useState<SwotForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [improveInstruction, setImproveInstruction] = useState('');

  const isBusy = isSaving || isImproving || isExporting;

  useEffect(() => {
    if (!swotId) return;
    void loadSwot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swotId]);

  async function loadSwot() {
    setIsLoading(true);
    try {
      const response = await fetcher<SwotDetail>(`/swot/${swotId}`, {
        method: 'GET',
        requireAuth: true,
      });
      const data = response.data;
      if (!data) throw new Error('Analyse SWOT introuvable');
      setSwot(data);
      setForm(swotToForm(data));
      try {
        const stratRes = await fetcher<Strategy>(`/strategies/${data.strategyId}`, {
          method: 'GET',
          requireAuth: true,
        });
        setStrategy(stratRes.data ?? null);
      } catch {
        // la stratégie peut ne pas être accessible
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!swotId || !form) return;
    setIsSaving(true);
    try {
      const response = await fetcher<SwotDetail>(`/swot/${swotId}`, {
        method: 'PATCH',
        requireAuth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          inputs: form.inputs,
          swot: form.matrix,
        }),
      });
      const updated = response.data;
      if (updated) {
        setSwot(updated);
        setForm(swotToForm(updated));
      }
      setIsEditing(false);
      toast.success('SWOT enregistré avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (swot) setForm(swotToForm(swot));
    setIsEditing(false);
  };

  const handleImprove = async () => {
    if (!swotId) return;
    setIsImproving(true);
    try {
      const response = await fetcher<SwotDetail>(`/swot/${swotId}/improve`, {
        method: 'POST',
        requireAuth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: improveInstruction.trim() || undefined }),
      });
      const improved = response.data;
      if (improved) {
        setSwot(improved);
        setForm(swotToForm(improved));
      }
      setIsImproveModalOpen(false);
      setImproveInstruction('');
      toast.success("SWOT amélioré avec l'IA");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'amélioration par IA");
    } finally {
      setIsImproving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!swotId) return;
    setIsExporting(true);
    try {
      const response = await fetcher<SwotPdfExportPayload>(`/swot/${swotId}/export-pdf`, {
        method: 'GET',
        requireAuth: true,
      });
      const payload = response.data;
      if (!payload) throw new Error('Données PDF introuvables');
      generateSwotPdf(payload);
      toast.success('PDF SWOT généré avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  if (!swot || !form) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        Analyse SWOT introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '14px',
          },
        }}
      />

      {/* En-tête */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/user/swot"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux analyses SWOT
          </Link>
          {isEditing ? (
            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, title: event.target.value } : prev))
              }
              className="mt-1 block w-full max-w-xl rounded-xl border border-violet-300 px-3 py-2 text-2xl font-bold text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          ) : (
            <h1 className="text-2xl font-bold text-slate-900">{form.title || swot.title}</h1>
          )}
          <p className="mt-1.5 text-sm text-slate-500">
            Créé le {formatDate(swot.createdAt)} · mis à jour le {formatDate(swot.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isBusy}
              className="inline-flex items-center rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Modifier
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className="inline-flex items-center rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isBusy}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsImproveModalOpen(true)}
            disabled={isBusy}
            className="inline-flex items-center rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Améliorer avec l&apos;IA
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isBusy}
            className="inline-flex items-center rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Génération...' : 'Télécharger PDF'}
          </button>
        </div>
      </section>

      {/* Stratégie liée */}
      {strategy && (
        <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">Stratégie liée</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">{strategy.businessInfo.businessName}</p>
              <p className="text-sm text-slate-500">
                Objectif : {strategy.businessInfo.mainObjective || '-'} · Ton : {strategy.businessInfo.tone || '-'}
              </p>
            </div>
            <Link
              href={`/user/strategies/${swot.strategyId}`}
              className="inline-flex items-center rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 active:scale-95"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Voir la stratégie
            </Link>
          </div>
        </section>
      )}

      {/* Paramètres */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
          <span className="h-5 w-1 rounded-full bg-violet-500" />
          Paramètres
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes internes
            </label>
            <textarea
              value={form.inputs.notesInternes}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, inputs: { ...prev.inputs, notesInternes: event.target.value } } : prev))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
                isEditing ? 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes externes
            </label>
            <textarea
              value={form.inputs.notesExternes}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, inputs: { ...prev.inputs, notesExternes: event.target.value } } : prev))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
                isEditing ? 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Concurrents
            </label>
            <textarea
              value={stringifyList(form.inputs.concurrents)}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, inputs: { ...prev.inputs, concurrents: parseList(event.target.value, 20) } } : prev))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
                isEditing ? 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ressources
            </label>
            <textarea
              value={stringifyList(form.inputs.ressources)}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, inputs: { ...prev.inputs, ressources: parseList(event.target.value, 20) } } : prev))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
                isEditing ? 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Objectifs
            </label>
            <textarea
              value={form.inputs.objectifs}
              onChange={(event) =>
                setForm((prev) => (prev ? { ...prev, inputs: { ...prev.inputs, objectifs: event.target.value } } : prev))
              }
              rows={3}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
                isEditing ? 'border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Matrice SWOT */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
          <span className="h-5 w-1 rounded-full bg-violet-500" />
          Matrice SWOT
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Forces
            </h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.matrix.strengths)}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, matrix: { ...prev.matrix, strengths: parseList(event.target.value) } } : prev))
                }
                rows={6}
                className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Un élément par ligne…"
              />
            ) : (
              <ul className="space-y-1.5">
                {form.matrix.strengths.length > 0 ? (
                  form.matrix.strengths.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-slate-500">Aucun élément</li>
                )}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-rose-700">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Faiblesses
            </h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.matrix.weaknesses)}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, matrix: { ...prev.matrix, weaknesses: parseList(event.target.value) } } : prev))
                }
                rows={6}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                placeholder="Un élément par ligne…"
              />
            ) : (
              <ul className="space-y-1.5">
                {form.matrix.weaknesses.length > 0 ? (
                  form.matrix.weaknesses.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-slate-500">Aucun élément</li>
                )}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              Opportunités
            </h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.matrix.opportunities)}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, matrix: { ...prev.matrix, opportunities: parseList(event.target.value) } } : prev))
                }
                rows={6}
                className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="Un élément par ligne…"
              />
            ) : (
              <ul className="space-y-1.5">
                {form.matrix.opportunities.length > 0 ? (
                  form.matrix.opportunities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-slate-500">Aucun élément</li>
                )}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-amber-700">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Menaces
            </h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.matrix.threats)}
                onChange={(event) =>
                  setForm((prev) => (prev ? { ...prev, matrix: { ...prev.matrix, threats: parseList(event.target.value) } } : prev))
                }
                rows={6}
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Un élément par ligne…"
              />
            ) : (
              <ul className="space-y-1.5">
                {form.matrix.threats.length > 0 ? (
                  form.matrix.threats.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-slate-500">Aucun élément</li>
                )}
              </ul>
            )}
          </article>
        </div>
      </section>

      {/* Modal - Améliorer avec l'IA */}
      {isImproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Améliorer avec l&apos;IA</h3>
              <button
                type="button"
                onClick={() => setIsImproveModalOpen(false)}
                disabled={isImproving}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              Ajoutez une instruction pour guider l&apos;IA vers une amélioration plus ciblée.
            </p>
            <textarea
              value={improveInstruction}
              onChange={(event) => setImproveInstruction(event.target.value)}
              rows={5}
              placeholder="Ex. : Renforcer les opportunités B2B et clarifier les menaces concurrentielles."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              disabled={isImproving}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImproveModalOpen(false)}
                disabled={isImproving}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleImprove}
                disabled={isImproving}
                className="inline-flex items-center rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {isImproving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Lancer l&apos;amélioration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
