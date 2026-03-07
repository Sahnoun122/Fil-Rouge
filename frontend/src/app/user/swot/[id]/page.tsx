'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Edit3, Loader2, PenSquare, Save, Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetcher } from '@/src/utils/fetcher';

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

interface StrategyLinked {
  _id: string;
  businessInfo: {
    businessName: string;
    mainObjective: string;
    tone: string;
  };
}

interface SwotFormState {
  title: string;
  inputs: {
    notesInternes: string;
    notesExternes: string;
    concurrents: string[];
    ressources: string[];
    objectifs: string;
  };
  swot: SwotMatrix;
}

const emptyFormState: SwotFormState = {
  title: '',
  inputs: {
    notesInternes: '',
    notesExternes: '',
    concurrents: [],
    ressources: [],
    objectifs: '',
  },
  swot: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  },
};

const parseList = (value: string, max = 6): string[] =>
  value
    .split(/\n|,|;/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);

const stringifyList = (list?: string[]): string => (list?.length ? list.join('\n') : '');

const normalizeText = (value: string): string | undefined => {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

function SwotSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

export default function UserSwotDetailPage() {
  const params = useParams();
  const swotId = params.id as string;

  const [swot, setSwot] = useState<SwotDocument | null>(null);
  const [strategy, setStrategy] = useState<StrategyLinked | null>(null);
  const [form, setForm] = useState<SwotFormState>(emptyFormState);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [improveInstruction, setImproveInstruction] = useState('');

  const hydrateForm = (payload: SwotDocument): SwotFormState => ({
    title: payload.title || '',
    inputs: {
      notesInternes: payload.inputs?.notesInternes || '',
      notesExternes: payload.inputs?.notesExternes || '',
      concurrents: payload.inputs?.concurrents || [],
      ressources: payload.inputs?.ressources || [],
      objectifs: payload.inputs?.objectifs || '',
    },
    swot: {
      strengths: payload.swot?.strengths || [],
      weaknesses: payload.swot?.weaknesses || [],
      opportunities: payload.swot?.opportunities || [],
      threats: payload.swot?.threats || [],
    },
  });

  const loadSwot = async () => {
    if (!swotId) return;

    setIsLoading(true);

    try {
      const swotResponse = await fetcher<SwotDocument>(`/swot/${swotId}`, {
        method: 'GET',
        requireAuth: true,
      });

      const swotPayload = swotResponse.data;
      if (!swotPayload) {
        throw new Error('SWOT not found');
      }

      setSwot(swotPayload);
      setForm(hydrateForm(swotPayload));

      try {
        const strategyResponse = await fetcher<StrategyLinked>(`/strategies/${swotPayload.strategyId}`, {
          method: 'GET',
          requireAuth: true,
        });
        setStrategy(strategyResponse.data || null);
      } catch {
        setStrategy(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error loading SWOT');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSwot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swotId]);

  const updateSwotColumn = (key: keyof SwotMatrix, rawValue: string) => {
    setForm((prev) => ({
      ...prev,
      swot: {
        ...prev.swot,
        [key]: parseList(rawValue, 6),
      },
    }));
  };

  const handleCancelEdit = () => {
    if (!swot) return;
    setForm(hydrateForm(swot));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!swotId || !swot) return;

    setIsSaving(true);

    try {
      const response = await fetcher<SwotDocument>(`/swot/${swotId}`, {
        method: 'PATCH',
        requireAuth: true,
        body: JSON.stringify({
          title: normalizeText(form.title) || swot.title,
          inputs: {
            notesInternes: normalizeText(form.inputs.notesInternes),
            notesExternes: normalizeText(form.inputs.notesExternes),
            concurrents: form.inputs.concurrents,
            ressources: form.inputs.ressources,
            objectifs: normalizeText(form.inputs.objectifs),
          },
          swot: form.swot,
        }),
      });

      if (!response.data) {
        throw new Error('Invalid update');
      }

      setSwot(response.data);
      setForm(hydrateForm(response.data));
      setIsEditing(false);
      toast.success('SWOT saved successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error saving SWOT');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImprove = async () => {
    if (!swotId) return;

    setIsImproving(true);

    try {
      const response = await fetcher<SwotDocument>(`/swot/${swotId}/improve`, {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          instruction: normalizeText(improveInstruction),
        }),
      });

      if (!response.data) {
        throw new Error('Invalid improvement');
      }

      setSwot(response.data);
      setForm(hydrateForm(response.data));
      setImproveInstruction('');
      setIsImproveModalOpen(false);
      toast.success('SWOT improved with AI');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error improving SWOT with AI');
    } finally {
      setIsImproving(false);
    }
  };

  if (isLoading) {
    return <SwotSkeleton />;
  }

  if (!swot) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">SWOT not found.</div>;
  }

  const isBusy = isSaving || isImproving;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/user/swot"
            className="mb-2 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to SWOT analyses
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">{form.title || swot.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Created on {formatDate(swot.createdAt)} - updated on {formatDate(swot.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isBusy}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isBusy}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsImproveModalOpen(true)}
            disabled={isBusy}
            className="inline-flex items-center rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Improve with AI
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Linked strategy</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{strategy?.businessInfo.businessName || swot.strategyId}</p>
            <p className="text-sm text-slate-600">
              Objective: {strategy?.businessInfo.mainObjective || '-'} | Tone: {strategy?.businessInfo.tone || '-'}
            </p>
          </div>
          <Link
            href={`/strategies/${swot.strategyId}`}
            className="inline-flex items-center rounded-xl border border-cyan-300 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            View strategy
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Inputs</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Internal notes</label>
            <textarea
              value={form.inputs.notesInternes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, inputs: { ...prev.inputs, notesInternes: event.target.value } }))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition ${
                isEditing ? 'border-slate-300 focus:border-cyan-500 focus:ring-2' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">External notes</label>
            <textarea
              value={form.inputs.notesExternes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, inputs: { ...prev.inputs, notesExternes: event.target.value } }))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition ${
                isEditing ? 'border-slate-300 focus:border-cyan-500 focus:ring-2' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Competitors</label>
            <textarea
              value={stringifyList(form.inputs.concurrents)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, inputs: { ...prev.inputs, concurrents: parseList(event.target.value, 20) } }))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition ${
                isEditing ? 'border-slate-300 focus:border-cyan-500 focus:ring-2' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Resources</label>
            <textarea
              value={stringifyList(form.inputs.ressources)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, inputs: { ...prev.inputs, ressources: parseList(event.target.value, 20) } }))
              }
              rows={4}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition ${
                isEditing ? 'border-slate-300 focus:border-cyan-500 focus:ring-2' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Objectives</label>
            <textarea
              value={form.inputs.objectifs}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, inputs: { ...prev.inputs, objectifs: event.target.value } }))
              }
              rows={3}
              readOnly={!isEditing}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition ${
                isEditing ? 'border-slate-300 focus:border-cyan-500 focus:ring-2' : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">SWOT Matrix</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Strengths</h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.swot.strengths)}
                onChange={(event) => updateSwotColumn('strengths', event.target.value)}
                rows={10}
                className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 transition focus:border-emerald-500 focus:ring-2"
              />
            ) : (
              <ul className="space-y-2 text-sm text-slate-800">
                {form.swot.strengths.length > 0 ? (
                  form.swot.strengths.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-lg bg-white/70 px-2.5 py-2">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No items</li>
                )}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-rose-700">Weaknesses</h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.swot.weaknesses)}
                onChange={(event) => updateSwotColumn('weaknesses', event.target.value)}
                rows={10}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-rose-500 transition focus:border-rose-500 focus:ring-2"
              />
            ) : (
              <ul className="space-y-2 text-sm text-slate-800">
                {form.swot.weaknesses.length > 0 ? (
                  form.swot.weaknesses.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-lg bg-white/70 px-2.5 py-2">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No items</li>
                )}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">Opportunities</h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.swot.opportunities)}
                onChange={(event) => updateSwotColumn('opportunities', event.target.value)}
                rows={10}
                className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
              />
            ) : (
              <ul className="space-y-2 text-sm text-slate-800">
                {form.swot.opportunities.length > 0 ? (
                  form.swot.opportunities.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-lg bg-white/70 px-2.5 py-2">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No items</li>
                )}
              </ul>
            )}
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-amber-700">Threats</h3>
            {isEditing ? (
              <textarea
                value={stringifyList(form.swot.threats)}
                onChange={(event) => updateSwotColumn('threats', event.target.value)}
                rows={10}
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-amber-500 transition focus:border-amber-500 focus:ring-2"
              />
            ) : (
              <ul className="space-y-2 text-sm text-slate-800">
                {form.swot.threats.length > 0 ? (
                  form.swot.threats.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-lg bg-white/70 px-2.5 py-2">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No items</li>
                )}
              </ul>
            )}
          </article>
        </div>
      </section>

      {isImproveModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Improve with AI</h3>
              <button
                type="button"
                onClick={() => setIsImproveModalOpen(false)}
                disabled={isImproving}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              Add an instruction to guide the AI toward a more targeted improvement.
            </p>
            <textarea
              value={improveInstruction}
              onChange={(event) => setImproveInstruction(event.target.value)}
              rows={5}
              placeholder="E.g.: Strengthen B2B opportunities and clarify competitive threats."
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
              disabled={isImproving}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImproveModalOpen(false)}
                disabled={isImproving}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImprove}
                disabled={isImproving}
                className="inline-flex items-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Launch improvement
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
