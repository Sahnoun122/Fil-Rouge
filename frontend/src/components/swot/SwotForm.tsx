'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Building2, Loader2, Plus, Sparkles, Target, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import strategiesService from '@/src/services/strategiesService';
import { OBJECTIVE_LABELS, Strategy, TONE_LABELS } from '@/src/types/strategy.types';
import { fetcher } from '@/src/utils/fetcher';

const swotFormSchema = z.object({
  strategyId: z.string().min(1, 'Strategy ID requis'),
  title: z.string().max(120, '120 caracteres maximum').optional(),
  instruction: z.string().max(400, '400 caracteres maximum').optional(),
  inputs: z.object({
    notesInternes: z.string().max(1200, '1200 caracteres maximum').optional(),
    notesExternes: z.string().max(1200, '1200 caracteres maximum').optional(),
    concurrents: z.array(z.object({ value: z.string().max(120, '120 caracteres maximum') })),
    ressources: z.array(z.object({ value: z.string().max(120, '120 caracteres maximum') })),
    objectifs: z.string().max(600, '600 caracteres maximum').optional(),
  }),
  swot: z.object({
    strengths: z.array(z.object({ value: z.string().max(180, '180 caracteres maximum') })),
    weaknesses: z.array(z.object({ value: z.string().max(180, '180 caracteres maximum') })),
    opportunities: z.array(z.object({ value: z.string().max(180, '180 caracteres maximum') })),
    threats: z.array(z.object({ value: z.string().max(180, '180 caracteres maximum') })),
  }),
});

type SwotFormValues = z.infer<typeof swotFormSchema>;
type FormListItem = { value: string };

interface SwotInputsPayload {
  notesInternes?: string;
  notesExternes?: string;
  concurrents?: string[];
  ressources?: string[];
  objectifs?: string;
}

interface SwotMatrixPayload {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotDocument {
  _id: string;
  strategyId: string;
  title: string;
  inputs?: SwotInputsPayload;
  swot: SwotMatrixPayload;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SwotFormProps {
  strategyId?: string;
  className?: string;
  onSuccess?: (swot: SwotDocument, mode: 'ai' | 'manual') => void;
}

type TabKey = 'inputs' | 'resultat';

const cleanString = (value?: string): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const cleanStringArray = (values: FormListItem[]): string[] =>
  values
    .map((item) => item.value.trim())
    .filter((item) => item.length > 0);

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur est survenue';
};

const normalizeListForFieldArray = (values: string[]): FormListItem[] =>
  (values.length > 0 ? values : ['']).map((value) => ({ value }));

function DynamicListField({
  label,
  fields,
  onAdd,
  onRemove,
  registerPath,
  registerField,
  isLoading,
}: {
  label: string;
  fields: Array<{ id: string }>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  registerPath: (index: number) => string;
  registerField: UseFormRegister<SwotFormValues>;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <button
          type="button"
          onClick={onAdd}
          disabled={isLoading}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...registerField(registerPath(index) as never)}
              placeholder="Saisir un element..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={isLoading || fields.length <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-white text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
              aria-label={`Supprimer ${label} ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SwotForm({ strategyId, className = '', onSuccess }: SwotFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('inputs');
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [lastResult, setLastResult] = useState<SwotDocument | null>(null);

  const prefilledForStrategyRef = useRef<string | null>(null);
  const lastFetchedStrategyRef = useRef<string | null>(null);

  const {
    control,
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SwotFormValues>({
    resolver: zodResolver(swotFormSchema),
    defaultValues: {
      strategyId: strategyId || '',
      title: '',
      instruction: '',
      inputs: {
        notesInternes: '',
        notesExternes: '',
        concurrents: [{ value: '' }],
        ressources: [{ value: '' }],
        objectifs: '',
      },
      swot: {
        strengths: [{ value: '' }],
        weaknesses: [{ value: '' }],
        opportunities: [{ value: '' }],
        threats: [{ value: '' }],
      },
    },
    mode: 'onChange',
  });

  const strategyIdValue = watch('strategyId');

  const concurrentsFieldArray = useFieldArray({
    control,
    name: 'inputs.concurrents',
  });

  const ressourcesFieldArray = useFieldArray({
    control,
    name: 'inputs.ressources',
  });

  const strengthsFieldArray = useFieldArray({
    control,
    name: 'swot.strengths',
  });

  const weaknessesFieldArray = useFieldArray({
    control,
    name: 'swot.weaknesses',
  });

  const opportunitiesFieldArray = useFieldArray({
    control,
    name: 'swot.opportunities',
  });

  const threatsFieldArray = useFieldArray({
    control,
    name: 'swot.threats',
  });

  useEffect(() => {
    if (strategyId) {
      setValue('strategyId', strategyId);
    }
  }, [strategyId, setValue]);

  useEffect(() => {
    const run = async () => {
      const id = strategyIdValue?.trim();
      if (!id) {
        setStrategy(null);
        lastFetchedStrategyRef.current = null;
        return;
      }

      if (lastFetchedStrategyRef.current === id) {
        return;
      }

      setIsLoadingStrategy(true);
      try {
        const strategyResponse = await strategiesService.getStrategy(id);
        setStrategy(strategyResponse);
        lastFetchedStrategyRef.current = id;
      } catch (error) {
        setStrategy(null);
        lastFetchedStrategyRef.current = null;
        toast.error(`Strategie introuvable: ${getErrorMessage(error)}`);
      } finally {
        setIsLoadingStrategy(false);
      }
    };

    void run();
  }, [strategyIdValue]);

  useEffect(() => {
    if (!strategy) {
      return;
    }

    if (prefilledForStrategyRef.current === strategy._id) {
      return;
    }

    const objectiveLabel =
      OBJECTIVE_LABELS[strategy.businessInfo.mainObjective] || strategy.businessInfo.mainObjective;
    const toneLabel = TONE_LABELS[strategy.businessInfo.tone] || strategy.businessInfo.tone;

    const currentNotesInternes = getValues('inputs.notesInternes')?.trim();
    const currentNotesExternes = getValues('inputs.notesExternes')?.trim();
    const currentObjectifs = getValues('inputs.objectifs')?.trim();

    if (!currentNotesInternes) {
      setValue(
        'inputs.notesInternes',
        `Entreprise: ${strategy.businessInfo.businessName}\nSecteur: ${strategy.businessInfo.industry}\nOffre: ${strategy.businessInfo.productOrService}`,
      );
    }

    if (!currentNotesExternes) {
      setValue(
        'inputs.notesExternes',
        `Audience: ${strategy.businessInfo.targetAudience}\nLocalisation: ${strategy.businessInfo.location}`,
      );
    }

    if (!currentObjectifs) {
      setValue('inputs.objectifs', `${objectiveLabel} (${toneLabel})`);
    }

    prefilledForStrategyRef.current = strategy._id;
  }, [getValues, setValue, strategy]);

  const summary = useMemo(() => {
    if (!strategy) return null;

    const objectiveLabel =
      OBJECTIVE_LABELS[strategy.businessInfo.mainObjective] || strategy.businessInfo.mainObjective;
    const toneLabel = TONE_LABELS[strategy.businessInfo.tone] || strategy.businessInfo.tone;

    return {
      businessName: strategy.businessInfo.businessName,
      objectiveLabel,
      toneLabel,
    };
  }, [strategy]);

  const syncSwotResultToForm = (swot: SwotMatrixPayload) => {
    strengthsFieldArray.replace(normalizeListForFieldArray(swot.strengths));
    weaknessesFieldArray.replace(normalizeListForFieldArray(swot.weaknesses));
    opportunitiesFieldArray.replace(normalizeListForFieldArray(swot.opportunities));
    threatsFieldArray.replace(normalizeListForFieldArray(swot.threats));
  };

  const buildInputsPayload = (values: SwotFormValues): SwotInputsPayload => {
    const concurrents = cleanStringArray(values.inputs.concurrents || []);
    const ressources = cleanStringArray(values.inputs.ressources || []);

    return {
      notesInternes: cleanString(values.inputs.notesInternes),
      notesExternes: cleanString(values.inputs.notesExternes),
      concurrents: concurrents.length > 0 ? concurrents : undefined,
      ressources: ressources.length > 0 ? ressources : undefined,
      objectifs: cleanString(values.inputs.objectifs),
    };
  };

  const buildSwotPayload = (values: SwotFormValues): SwotMatrixPayload => ({
    strengths: cleanStringArray(values.swot.strengths || []),
    weaknesses: cleanStringArray(values.swot.weaknesses || []),
    opportunities: cleanStringArray(values.swot.opportunities || []),
    threats: cleanStringArray(values.swot.threats || []),
  });

  const handleGenerate = async () => {
    const values = getValues();
    if (!values.strategyId.trim()) {
      toast.error('Strategy ID requis');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetcher<SwotDocument>('/swot/generate', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          strategyId: values.strategyId.trim(),
          inputs: buildInputsPayload(values),
          instruction: cleanString(values.instruction),
        }),
      });

      const swot = response.data;
      if (!swot) {
        throw new Error('Reponse de generation invalide');
      }

      setLastResult(swot);
      syncSwotResultToForm(swot.swot);
      setActiveTab('resultat');
      toast.success('SWOT genere avec succes');
      onSuccess?.(swot, 'ai');
    } catch (error) {
      toast.error(`Generation echouee: ${getErrorMessage(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    const values = getValues();
    if (!values.strategyId.trim()) {
      toast.error('Strategy ID requis');
      return;
    }

    setIsCreatingManual(true);
    try {
      const response = await fetcher<SwotDocument>('/swot/manual', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify({
          strategyId: values.strategyId.trim(),
          title: cleanString(values.title),
          inputs: buildInputsPayload(values),
          swot: buildSwotPayload(values),
        }),
      });

      const swot = response.data;
      if (!swot) {
        throw new Error('Reponse de creation invalide');
      }

      setLastResult(swot);
      syncSwotResultToForm(swot.swot);
      setActiveTab('resultat');
      toast.success('SWOT manuel cree avec succes');
      onSuccess?.(swot, 'manual');
    } catch (error) {
      toast.error(`Creation echouee: ${getErrorMessage(error)}`);
    } finally {
      setIsCreatingManual(false);
    }
  };

  const isBusy = isLoadingStrategy || isGenerating || isCreatingManual;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">SWOT Builder</h2>
            <p className="text-sm text-slate-600">
              Renseignez vos inputs, puis lancez une generation IA ou une creation manuelle.
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('inputs')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                activeTab === 'inputs' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inputs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resultat')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                activeTab === 'resultat' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resultat SWOT
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'inputs' ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Strategy ID *</label>
                <input
                  {...register('strategyId')}
                  placeholder="ObjectId strategie"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                  disabled={isBusy}
                />
                {errors.strategyId?.message ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.strategyId.message}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Titre SWOT (optionnel)</label>
                <input
                  {...register('title')}
                  placeholder="Ex: SWOT - Maison Elegance"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                  disabled={isBusy}
                />
              </div>
            </div>

            {isLoadingStrategy ? (
              <div className="mt-4 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement de la strategie...
              </div>
            ) : summary ? (
              <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/70 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
                  Resume strategie
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-cyan-200 bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Business</p>
                    <p className="mt-1 flex items-center text-sm font-semibold text-slate-900">
                      <Building2 className="mr-1.5 h-4 w-4 text-cyan-700" />
                      {summary.businessName}
                    </p>
                  </div>
                  <div className="rounded-lg border border-cyan-200 bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Objectif</p>
                    <p className="mt-1 flex items-center text-sm font-semibold text-slate-900">
                      <Target className="mr-1.5 h-4 w-4 text-cyan-700" />
                      {summary.objectiveLabel}
                    </p>
                  </div>
                  <div className="rounded-lg border border-cyan-200 bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Tone</p>
                    <p className="mt-1 flex items-center text-sm font-semibold text-slate-900">
                      <Sparkles className="mr-1.5 h-4 w-4 text-cyan-700" />
                      {summary.toneLabel}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-900">Inputs</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes internes</label>
                <textarea
                  {...register('inputs.notesInternes')}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                  disabled={isBusy}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes externes</label>
                <textarea
                  {...register('inputs.notesExternes')}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                  disabled={isBusy}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Objectifs</label>
                <textarea
                  {...register('inputs.objectifs')}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <DynamicListField
                label="Concurrents"
                fields={concurrentsFieldArray.fields}
                onAdd={() => concurrentsFieldArray.append({ value: '' })}
                onRemove={(index) => concurrentsFieldArray.remove(index)}
                registerPath={(index) => `inputs.concurrents.${index}.value`}
                registerField={register}
                isLoading={isBusy}
              />
              <DynamicListField
                label="Ressources"
                fields={ressourcesFieldArray.fields}
                onAdd={() => ressourcesFieldArray.append({ value: '' })}
                onRemove={(index) => ressourcesFieldArray.remove(index)}
                registerPath={(index) => `inputs.ressources.${index}.value`}
                registerField={register}
                isLoading={isBusy}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Instruction pour generation IA (optionnel)
            </label>
            <textarea
              {...register('instruction')}
              rows={3}
              placeholder="Ex: Focus sur croissance e-commerce et acquisition B2B"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2"
              disabled={isBusy}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-900">Matrice SWOT</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DynamicListField
                label="Strengths"
                fields={strengthsFieldArray.fields}
                onAdd={() => strengthsFieldArray.append({ value: '' })}
                onRemove={(index) => strengthsFieldArray.remove(index)}
                registerPath={(index) => `swot.strengths.${index}.value`}
                registerField={register}
                isLoading={isBusy}
              />
              <DynamicListField
                label="Weaknesses"
                fields={weaknessesFieldArray.fields}
                onAdd={() => weaknessesFieldArray.append({ value: '' })}
                onRemove={(index) => weaknessesFieldArray.remove(index)}
                registerPath={(index) => `swot.weaknesses.${index}.value`}
                registerField={register}
                isLoading={isBusy}
              />
              <DynamicListField
                label="Opportunities"
                fields={opportunitiesFieldArray.fields}
                onAdd={() => opportunitiesFieldArray.append({ value: '' })}
                onRemove={(index) => opportunitiesFieldArray.remove(index)}
                registerPath={(index) => `swot.opportunities.${index}.value`}
                registerField={register}
                isLoading={isBusy}
              />
              <DynamicListField
                label="Threats"
                fields={threatsFieldArray.fields}
                onAdd={() => threatsFieldArray.append({ value: '' })}
                onRemove={(index) => threatsFieldArray.remove(index)}
                registerPath={(index) => `swot.threats.${index}.value`}
                registerField={register}
                isLoading={isBusy}
              />
            </div>
          </div>

          {lastResult ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Dernier SWOT recu: <span className="font-semibold">{lastResult.title || lastResult._id}</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Aucun resultat pour le moment. Utilisez les boutons ci-dessous pour generer ou creer un SWOT.
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generation IA...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Generer SWOT avec IA
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCreateManual}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingManual ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creation...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Creer SWOT manuel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
