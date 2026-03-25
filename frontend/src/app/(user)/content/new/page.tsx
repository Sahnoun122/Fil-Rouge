'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { fetcher } from '@/src/utils/fetcher';

type ToneValue = 'friendly' | 'professional' | 'luxury' | 'young';

interface StrategyOption {
  _id: string;
  businessInfo: {
    businessName: string;
    industry: string;
  };
}

interface StrategiesListResponse {
  strategies: StrategyOption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const toneOptions: Array<{ label: string; value: ToneValue }> = [
  { label: 'Friendly', value: 'friendly' },
  { label: 'Professional', value: 'professional' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Young', value: 'young' },
];

const platformOptions = [
  { label: 'Instagram', value: 'Instagram', helper: 'Reels, carousels, sponsored posts' },
  { label: 'Facebook', value: 'Facebook', helper: 'Posts, conversion and traffic campaigns' },
  { label: 'TikTok', value: 'TikTok', helper: 'Short videos, vertical ads, native captions' },
  { label: 'LinkedIn', value: 'LinkedIn', helper: 'Expertise, B2B, lead gen and brand content' },
  { label: 'YouTube', value: 'YouTube', helper: 'Shorts, video ads and video descriptions' },
  { label: 'X', value: 'X', helper: 'Short messages, sponsored or organic threads' },
  { label: 'Snapchat', value: 'Snapchat', helper: 'Stories, fast mobile format, native ads' },
  { label: 'Pinterest', value: 'Pinterest', helper: 'Pins, visual inspiration and evergreen traffic' },
  { label: 'Threads', value: 'Threads', helper: 'Conversational, community-driven, quick content' },
];

const formSchema = z
  .object({
    strategyId: z.string().min(1, 'Strategy is required'),
    mode: z.enum(['ADS', 'CONTENT_MARKETING']),
    name: z.string().max(120, 'Maximum 120 characters').optional(),
    callToAction: z.string().max(280, 'Maximum 280 characters').optional(),
    tone: z.union([z.enum(['friendly', 'professional', 'luxury', 'young']), z.literal('')]).optional(),
    productOffer: z.string().max(500, 'Maximum 500 characters').optional(),
    targetAudience: z.string().max(500, 'Maximum 500 characters').optional(),
    platforms: z.array(z.string()).min(1, 'Select at least one platform'),
    promoDetails: z.string().max(1000, 'Maximum 1000 characters').optional(),
    budget: z.string().optional(),
    frequencyPerWeek: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'CONTENT_MARKETING') {
      const parsedFrequency = Number(value.frequencyPerWeek);
      if (!Number.isInteger(parsedFrequency) || parsedFrequency < 1 || parsedFrequency > 21) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Weekly frequency is required',
          path: ['frequencyPerWeek'],
        });
      }
    }

    if (value.mode === 'ADS' && value.budget?.trim()) {
      const parsedBudget = Number(value.budget);
      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Budget must be a positive number',
          path: ['budget'],
        });
      }
    }

    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const normalizeOptionalText = (value?: string): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

export default function NewContentCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strategyId: '',
      mode: 'CONTENT_MARKETING',
      name: '',
      callToAction: '',
      tone: '',
      productOffer: '',
      targetAudience: '',
      platforms: [],
      promoDetails: '',
      budget: '',
      frequencyPerWeek: '3',
      startDate: '',
      endDate: '',
    },
  });

  const mode = watch('mode');
  const selectedStrategyId = watch('strategyId');
  const selectedPlatforms = watch('platforms');

  useEffect(() => {
    const queryStrategyId = searchParams.get('strategyId');
    if (queryStrategyId) {
      setValue('strategyId', queryStrategyId);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    const loadStrategies = async () => {
      setIsLoadingStrategies(true);
      try {
        const response = await fetcher<StrategiesListResponse>('/strategies?page=1&limit=100', {
          method: 'GET',
          requireAuth: true,
        });

        setStrategies(response.data?.strategies ?? []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load strategies');
      } finally {
        setIsLoadingStrategies(false);
      }
    };

    void loadStrategies();
  }, []);

  const selectedStrategy = useMemo(
    () => strategies.find((strategy) => strategy._id === selectedStrategyId),
    [selectedStrategyId, strategies],
  );

  const togglePlatform = (platform: string) => {
    const hasPlatform = selectedPlatforms.includes(platform);
    const nextPlatforms = hasPlatform
      ? selectedPlatforms.filter((item) => item !== platform)
      : [...selectedPlatforms, platform];

    setValue('platforms', nextPlatforms, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        strategyId: values.strategyId,
        mode: values.mode,
        name: normalizeOptionalText(values.name),
        inputs: {
          callToAction: normalizeOptionalText(values.callToAction),
          tone: values.tone || undefined,
          productOffer: normalizeOptionalText(values.productOffer),
          targetAudience: normalizeOptionalText(values.targetAudience),
          platforms: values.platforms,
          ...(values.mode === 'ADS'
            ? {
                promoDetails: normalizeOptionalText(values.promoDetails),
                budget: values.budget?.trim() ? Number(values.budget) : undefined,
              }
            : {
                frequencyPerWeek: values.frequencyPerWeek?.trim()
                  ? Number(values.frequencyPerWeek)
                  : undefined,
                startDate: normalizeOptionalText(values.startDate),
                endDate: normalizeOptionalText(values.endDate),
              }),
        },
      };

      const response = await fetcher<{ _id: string }>('/content/campaigns', {
        method: 'POST',
        body: JSON.stringify(payload),
        requireAuth: true,
      });

      const createdId = response.data?._id;
      if (!createdId) {
        throw new Error('Created but ID not found');
      }

      toast.success('Content campaign created successfully');
      router.push(`/user/content/${createdId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error while creating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/user/content"
          className="inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to campaigns
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">New Content Campaign</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure your campaign and launch content generation.
        </p>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Strategy *</label>
              <select
                {...register('strategyId')}
                disabled={isLoadingStrategies}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-100"
              >
                <option value="">{isLoadingStrategies ? 'Loading...' : 'Select a strategy'}</option>
                {strategies.map((strategy) => (
                  <option key={strategy._id} value={strategy._id}>
                    {strategy.businessInfo.businessName} - {strategy.businessInfo.industry}
                  </option>
                ))}
              </select>
              {errors.strategyId ? (
                <p className="mt-1 text-xs text-rose-600">{errors.strategyId.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mode *</label>
              <select
                {...register('mode')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="ADS">ADS</option>
                <option value="CONTENT_MARKETING">CONTENT_MARKETING</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name (optional)</label>
              <input
                {...register('name')}
                placeholder="Ex: Summer launch 2026"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Call to action</label>
              <input
                {...register('callToAction')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              {errors.callToAction ? (
                <p className="mt-1 text-xs text-rose-600">{errors.callToAction.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tone</label>
              <select
                {...register('tone')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">Select a tone</option>
                {toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Product offer</label>
              <textarea
                {...register('productOffer')}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Target audience</label>
              <textarea
                {...register('targetAudience')}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700">Platforms *</label>
                <span className="text-xs text-slate-500">{selectedPlatforms.length} selected</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {platformOptions.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.value);

                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => togglePlatform(platform.value)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${
                            isSelected
                              ? 'border-cyan-600 bg-cyan-600 text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{platform.label}</p>
                          <p className="mt-1 text-xs text-slate-600">{platform.helper}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.platforms ? (
                <p className="mt-1 text-xs text-rose-600">{errors.platforms.message}</p>
              ) : null}
            </div>

            {mode === 'ADS' ? (
              <>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Promo details</label>
                  <textarea
                    {...register('promoDetails')}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    {...register('budget')}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  {errors.budget ? <p className="mt-1 text-xs text-rose-600">{errors.budget.message}</p> : null}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Frequency per week</label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    {...register('frequencyPerWeek')}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  {errors.frequencyPerWeek ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.frequencyPerWeek.message}</p>
                  ) : null}
                </div>

                <div />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Start date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('startDate')}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">End date</label>
                  <input
                    type="date"
                    min={watch('startDate') || new Date().toISOString().split('T')[0]}
                    {...register('endDate')}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  {errors.endDate ? <p className="mt-1 text-xs text-rose-600">{errors.endDate.message}</p> : null}
                </div>
              </>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Summary</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>
                Mode: <span className="font-semibold text-slate-900">{mode}</span>
              </li>
              <li>
                Strategy:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedStrategy?.businessInfo.businessName || 'Not selected'}
                </span>
              </li>
              <li>
                Platforms:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'None'}
                </span>
              </li>
              <li>
                Industry:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedStrategy?.businessInfo.industry || '-'}
                </span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              <Sparkles className="h-4 w-4" />
              Creation
            </p>
            <p className="mt-3 text-sm text-cyan-900">
              Campaign will be created and redirected to its details page.
            </p>
          </article>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingStrategies}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create campaign'
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}
