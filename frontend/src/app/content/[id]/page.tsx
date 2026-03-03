"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useContentCampaign } from "@/src/hooks/useContentCampaigns";
import type {
  AutoScheduleCampaignDto,
  ContentCampaign,
} from "@/src/types/content.types";

const DEFAULT_WINDOWS: Record<string, string[]> = {
  instagram: ["12:00-14:00", "18:00-21:00"],
  tiktok: ["19:00-23:00", "12:00-14:00"],
  facebook: ["12:00-14:00", "18:00-20:00"],
  linkedin: ["08:00-10:00", "12:00-14:00"],
  youtube: ["17:00-21:00"],
  pinterest: ["20:00-23:00"],
  x: ["09:00-11:00", "12:00-14:00", "17:00-19:00"],
  snapchat: ["17:00-21:00"],
  threads: ["12:00-14:00", "18:00-20:00"],
};

function normalizePlatformKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function browserTimezone() {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Casablanca"
    );
  } catch {
    return "Africa/Casablanca";
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildAutoSchedulePayload(
  campaign: ContentCampaign,
): AutoScheduleCampaignDto {
  const startDate = campaign.inputs?.startDate?.slice(0, 10) || todayIso();
  const endDate =
    campaign.inputs?.endDate?.slice(0, 10) || addDays(startDate, 27);
  const preferredTimeWindows = campaign.platforms.reduce<
    Record<string, string[]>
  >((acc, platform) => {
    acc[normalizePlatformKey(platform)] = DEFAULT_WINDOWS[
      normalizePlatformKey(platform)
    ] ?? ["11:00-13:00", "17:00-19:00"];
    return acc;
  }, {});

  return {
    startDate,
    endDate,
    frequencyPerWeek:
      campaign.inputs?.frequencyPerWeek ??
      campaign.campaignSummary?.postingPlan?.frequencyPerWeek ??
      4,
    timezone: browserTimezone(),
    excludedDays: ["sunday"],
    preferredTimeWindows,
    syncToCalendar: true,
  };
}

function scheduleText(
  schedule?: ContentCampaign["generatedPosts"][number]["schedule"],
) {
  if (!schedule?.date || !schedule?.time) {
    return "Non planifie";
  }

  return `${schedule.date} ${schedule.time}`;
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-32 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
      <div className="h-40 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
      <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
    </div>
  );
}

export default function ContentCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const {
    campaign,
    isLoading,
    isSubmitting,
    error,
    generateCampaign,
    autoScheduleCampaign,
    regeneratePlatform,
    regeneratePost,
  } = useContentCampaign(campaignId);

  const [generateInstruction, setGenerateInstruction] = useState("");
  const [platformToRegenerate, setPlatformToRegenerate] = useState("");
  const [platformInstruction, setPlatformInstruction] = useState("");
  const [postIndexInput, setPostIndexInput] = useState("0");
  const [postInstruction, setPostInstruction] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const posts = useMemo(
    () =>
      (campaign?.generatedPosts ?? []).map((post, index) => ({
        ...post,
        index,
      })),
    [campaign],
  );

  const scheduledCount = posts.filter(
    (post) => post.schedule?.date && post.schedule?.time,
  ).length;

  const handleGenerate = async () => {
    if (!campaignId) return;

    try {
      await generateCampaign(campaignId, {
        instruction: generateInstruction.trim() || undefined,
      });
      toast.success("Contenu genere avec succes");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur de generation",
      );
    }
  };

  const handleRegeneratePlatform = async () => {
    if (!campaignId || !platformToRegenerate) {
      toast.error("Selectionnez une plateforme");
      return;
    }

    try {
      await regeneratePlatform(campaignId, {
        platform: platformToRegenerate,
        instruction: platformInstruction.trim() || undefined,
      });
      toast.success(`Posts ${platformToRegenerate} regeneres`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur de regeneration plateforme",
      );
    }
  };

  const handleRegeneratePost = async () => {
    if (!campaignId) return;
    const index = Number(postIndexInput);

    if (!Number.isInteger(index) || index < 0) {
      toast.error("Index de post invalide");
      return;
    }

    try {
      await regeneratePost(campaignId, {
        index,
        instruction: postInstruction.trim() || undefined,
      });
      toast.success(`Post #${index} regenere`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur de regeneration du post",
      );
    }
  };

  const handleGeneratePlanning = async () => {
    if (!campaignId || !campaign) {
      return;
    }

    setIsScheduling(true);
    try {
      await autoScheduleCampaign(
        campaignId,
        buildAutoSchedulePayload(campaign),
      );
      toast.success("Planning genere. Redirection vers le calendrier...");
      router.push(`/calendar?campaignId=${campaign._id}`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur lors de la generation du planning",
      );
    } finally {
      setIsScheduling(false);
    }
  };

  if (isLoading && !campaign) {
    return <DetailSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-700">
          Campagne introuvable
        </h1>
        <p className="mt-2 text-sm text-rose-600">
          {error || "Cette campagne n est plus accessible."}
        </p>
        <Link
          href="/user/content"
          className="mt-4 inline-flex items-center rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
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
            borderRadius: "18px",
            border: "1px solid #e7e5e4",
            background: "#fffaf4",
            color: "#1c1917",
          },
        }}
      />

      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(245,247,250,0.98)_38%,_rgba(229,231,235,0.92)_100%)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <Link
              href="/user/content"
              className="inline-flex items-center text-sm font-medium text-stone-600 transition hover:text-stone-950"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Retour aux campagnes
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Content campaign
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              {campaign.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Cette page reste concentree sur la campagne. La lecture du
              planning se fait dans le calendrier, avec une vue plus propre et
              plus operationnelle.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">
                {campaign.mode}
              </span>
              {campaign.platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-stone-300 bg-white/80 px-3 py-1 text-xs font-medium text-stone-700"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={`/user/content/new?strategyId=${campaign.strategyId}`}
            className="inline-flex items-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Posts generes
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {posts.length}
          </p>
        </article>
        <article className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Posts planifies
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {scheduledCount}
          </p>
        </article>
        <article className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Frequence
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">
            {campaign.campaignSummary?.postingPlan?.frequencyPerWeek ?? "-"}
          </p>
        </article>
        <article className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Mise a jour
          </p>
          <p className="mt-2 text-sm font-semibold text-stone-950">
            {formatDateTime(campaign.updatedAt)}
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-cyan-200 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(255,255,255,1))] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Planification automatique
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Generer le planning puis travailler dans le calendrier
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Un seul clic applique les heuristiques de planification,
              enregistre les horaires et synchronise la campagne avec le module
              calendrier.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGeneratePlanning}
              disabled={isScheduling || isSubmitting}
              className="inline-flex items-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isScheduling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="mr-2 h-4 w-4" />
              )}
              Generer un planning
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(`/calendar?campaignId=${campaign._id}`)
              }
              className="inline-flex items-center rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Ouvrir le calendrier
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Generation globale
          </h2>
          <textarea
            value={generateInstruction}
            onChange={(event) => setGenerateInstruction(event.target.value)}
            rows={3}
            placeholder="Instruction optionnelle (ex: accent sur conversion mobile)."
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-2xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            Generer le contenu
          </button>
        </article>

        <article className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Regeneration</h2>
          <select
            value={platformToRegenerate}
            onChange={(event) => setPlatformToRegenerate(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">Selectionnez une plateforme</option>
            {campaign.platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <textarea
            value={platformInstruction}
            onChange={(event) => setPlatformInstruction(event.target.value)}
            rows={2}
            placeholder="Instruction optionnelle pour la plateforme."
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={handleRegeneratePlatform}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerer la plateforme
          </button>

          <div className="h-px bg-stone-200" />

          <input
            type="number"
            min={0}
            value={postIndexInput}
            onChange={(event) => setPostIndexInput(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <textarea
            value={postInstruction}
            onChange={(event) => setPostInstruction(event.target.value)}
            rows={2}
            placeholder="Instruction optionnelle pour le post."
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={handleRegeneratePost}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerer le post
          </button>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-950">
            Posts de la campagne
          </h2>
          <span className="text-sm text-stone-600">{posts.length} posts</span>
        </div>

        {error ? (
          <article className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </article>
        ) : null}

        {posts.length === 0 ? (
          <article className="rounded-[28px] border border-dashed border-stone-300 bg-white p-10 text-center">
            <FileText className="mx-auto h-9 w-9 text-stone-400" />
            <h3 className="mt-3 text-lg font-semibold text-stone-950">
              Aucun post genere
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Lancez une generation globale pour remplir cette campagne.
            </p>
          </article>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article
                key={post._id || `${post.platform}-${post.index}`}
                className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-stone-950 px-2.5 py-1 text-xs font-semibold text-white">
                      #{post.index}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {post.platform}
                    </span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-800">
                      {post.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {scheduleText(post.schedule)}
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                  {post.caption}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
