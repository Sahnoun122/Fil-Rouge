'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useContentCampaign } from '@/src/hooks/useContentCampaigns';
import { ContentMode } from '@/src/types/content.types';
import { Strategy } from '@/src/types/strategy.types';
import strategiesService from '@/src/services/strategiesService';

const splitInputList = (value: string): string[] =>
  value
    .split(/,|\n|;/g)
    .map((item) => item.trim())
    .filter(Boolean);

export default function NewContentCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createCampaign, isSubmitting, error } = useContentCampaign();

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(true);
  const [strategyId, setStrategyId] = useState('');
  const [mode, setMode] = useState<ContentMode>('CONTENT_MARKETING');
  const [name, setName] = useState('');

  const [productOffer, setProductOffer] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [platforms, setPlatforms] = useState('');

  const [promoDetails, setPromoDetails] = useState('');
  const [budget, setBudget] = useState('');

  const [contentPillars, setContentPillars] = useState('');
  const [frequencyPerWeek, setFrequencyPerWeek] = useState('3');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const preselectedStrategyId = searchParams.get('strategyId');
    if (preselectedStrategyId) {
      setStrategyId(preselectedStrategyId);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadStrategies = async () => {
      setIsLoadingStrategies(true);
      try {
        const result = await strategiesService.getAllStrategies(1, 100);
        setStrategies(result.strategies ?? []);
      } catch (requestError) {
        toast.error(requestError instanceof Error ? requestError.message : 'Erreur de chargement des strategies');
      } finally {
        setIsLoadingStrategies(false);
      }
    };

    void loadStrategies();
  }, []);

  const selectedStrategy = useMemo(
    () => strategies.find((strategy) => strategy._id === strategyId),
    [strategies, strategyId],
  );

  const handleCreate = async () => {
    if (!strategyId) {
      toast.error('Selectionnez une strategie');
      return;
    }

    try {
      const newCampaign = await createCampaign({
        strategyId,
        mode,
        name: name.trim() || undefined,
        inputs: {
          productOffer: productOffer.trim() || undefined,
          targetAudience: targetAudience.trim() || undefined,
          tone: tone.trim() || undefined,
          callToAction: callToAction.trim() || undefined,
          platforms: splitInputList(platforms),
          ...(mode === 'ADS'
            ? {
                promoDetails: promoDetails.trim() || undefined,
                budget: budget ? Number(budget) : undefined,
              }
            : {
                contentPillars: splitInputList(contentPillars),
                frequencyPerWeek: frequencyPerWeek ? Number(frequencyPerWeek) : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
              }),
        },
      });

      toast.success('Campagne content creee');
      router.push(`/content/${newCampaign._id}`);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Erreur de creation');
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <Link
          href="/content"
          className="inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Retour aux campagnes
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Nouvelle campagne Content</h1>
        <p className="mt-2 text-sm text-slate-600">
          Créez une campagne Ads ou Content Marketing à partir d&apos;une stratégie.
        </p>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Strategie source *</label>
              <select
                value={strategyId}
                onChange={(event) => setStrategyId(event.target.value)}
                disabled={isLoadingStrategies}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nom campagne (optionnel)</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Lancement printemps 2026"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mode *</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode('CONTENT_MARKETING')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    mode === 'CONTENT_MARKETING'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Content Marketing
                </button>
                <button
                  type="button"
                  onClick={() => setMode('ADS')}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    mode === 'ADS'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Ads
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Offre</label>
              <input
                value={productOffer}
                onChange={(event) => setProductOffer(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Audience cible</label>
              <input
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Ton</label>
              <input
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">CTA principal</label>
              <input
                value={callToAction}
                onChange={(event) => setCallToAction(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Plateformes (optionnel, separer par virgule/ligne)
              </label>
              <textarea
                value={platforms}
                onChange={(event) => setPlatforms(event.target.value)}
                rows={3}
                placeholder="Instagram, TikTok, LinkedIn"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {mode === 'ADS' ? (
              <>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Details promo</label>
                  <textarea
                    value={promoDetails}
                    onChange={(event) => setPromoDetails(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget</label>
                  <input
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Content pillars (virgule/ligne)
                  </label>
                  <textarea
                    value={contentPillars}
                    onChange={(event) => setContentPillars(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Frequence / semaine</label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={frequencyPerWeek}
                    onChange={(event) => setFrequencyPerWeek(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date debut</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Recap</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>
                Mode: <span className="font-semibold text-slate-900">{mode}</span>
              </li>
              <li>
                Strategie:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedStrategy?.businessInfo.businessName || 'Non selectionnee'}
                </span>
              </li>
              <li>
                Secteur: <span className="font-semibold text-slate-900">{selectedStrategy?.businessInfo.industry || '-'}</span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              <Sparkles className="h-4 w-4" />
              Conseil
            </p>
            <p className="mt-3 text-sm text-cyan-900">
              Renseignez les plateformes seulement si vous voulez forcer celles de la stratégie.
            </p>
          </article>

          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting || isLoadingStrategies}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creation...
              </>
            ) : (
              'Creer la campagne'
            )}
          </button>
        </aside>
      </section>
    </div>
  );
}
