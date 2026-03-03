"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  Check,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useContentCampaign } from "@/src/hooks/useContentCampaigns";
import type {
  AutoScheduleCampaignDto,
  ContentCampaign,
  PostSchedule,
} from "@/src/types/content.types";

const DAYS = [
  { key: "monday", short: "Lun" },
  { key: "tuesday", short: "Mar" },
  { key: "wednesday", short: "Mer" },
  { key: "thursday", short: "Jeu" },
  { key: "friday", short: "Ven" },
  { key: "saturday", short: "Sam" },
  { key: "sunday", short: "Dim" },
] as const;

const DEFAULT_WINDOWS: Record<string, string[]> = {
  instagram: ["12:00-14:00", "18:00-21:00"],
  tiktok: ["19:00-23:00", "12:00-14:00"],
  facebook: ["12:00-14:00", "18:00-20:00"],
  linkedin: ["08:00-10:00", "12:00-14:00"],
  youtube: ["17:00-21:00"],
  pinterest: ["20:00-23:00"],
};

type DraftMap = Record<string, PostSchedule>;

function keyFor(postId: string | undefined, index: number) {
  return postId || String(index);
}

function platformKey(value: string) {
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

function mondayOf(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function scheduleText(schedule?: PostSchedule) {
  if (!schedule?.date || !schedule?.time) return "Non planifie";
  return `${schedule.date} ${schedule.time} (${schedule.timezone})`;
}

function buildPlannerState(campaign: ContentCampaign | null) {
  const timezone = browserTimezone();
  const preferredTimeWindows: Record<string, string[]> = {};
  (campaign?.platforms ?? []).forEach((platform) => {
    preferredTimeWindows[platformKey(platform)] = DEFAULT_WINDOWS[
      platformKey(platform)
    ] ?? ["11:00-13:00", "17:00-19:00"];
  });

  return {
    startDate: campaign?.inputs?.startDate?.slice(0, 10) ?? "",
    endDate: campaign?.inputs?.endDate?.slice(0, 10) ?? "",
    frequencyPerWeek:
      campaign?.inputs?.frequencyPerWeek ??
      campaign?.campaignSummary?.postingPlan?.frequencyPerWeek ??
      4,
    timezone,
    excludedDays: ["sunday"],
    preferredTimeWindows,
    syncToCalendar: true,
  };
}

function buildDrafts(
  campaign: ContentCampaign | null,
  timezone: string,
): DraftMap {
  if (!campaign) return {};
  return campaign.generatedPosts.reduce<DraftMap>((acc, post, index) => {
    acc[keyFor(post._id, index)] = {
      date: post.schedule?.date ?? "",
      time: post.schedule?.time ?? "",
      timezone: post.schedule?.timezone ?? timezone,
    };
    return acc;
  }, {});
}

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="h-32 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
      <div className="h-96 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
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
    updateCampaign,
    regeneratePlatform,
    regeneratePost,
  } = useContentCampaign(campaignId);

  const [generateInstruction, setGenerateInstruction] = useState("");
  const [platformToRegenerate, setPlatformToRegenerate] = useState("");
  const [platformInstruction, setPlatformInstruction] = useState("");
  const [postIndexInput, setPostIndexInput] = useState("0");
  const [postInstruction, setPostInstruction] = useState("");
  const [planner, setPlanner] = useState(() => buildPlannerState(null));
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!campaign) return;
    const next = buildPlannerState(campaign);
    setPlanner(next);
    setDrafts(buildDrafts(campaign, next.timezone));
  }, [campaign]);

  const posts = useMemo(
    () =>
      (campaign?.generatedPosts ?? []).map((post, index) => ({
        ...post,
        index,
      })),
    [campaign],
  );

  const weeks = useMemo(() => {
    const scheduled = posts.filter(
      (post) => post.schedule?.date && post.schedule?.time,
    );
    const grouped = new Map<string, Array<(typeof scheduled)[number]>>();
    scheduled.forEach((post) => {
      const weekKey = mondayOf(post.schedule!.date);
      const weekPosts = grouped.get(weekKey) ?? [];
      weekPosts.push(post);
      grouped.set(weekKey, weekPosts);
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, weekPosts]) => ({
        weekStart,
        days: DAYS.map((day, index) => {
          const date = addDays(weekStart, index);
          return {
            ...day,
            date,
            posts: weekPosts
              .filter((post) => post.schedule?.date === date)
              .sort((a, b) =>
                `${a.schedule?.time}`.localeCompare(`${b.schedule?.time}`),
              ),
          };
        }),
      }));
  }, [posts]);

  const onGenerate = async () => {
    if (!campaignId) return;
    try {
      await generateCampaign(campaignId, {
        instruction: generateInstruction.trim() || undefined,
      });
      toast.success("Contenu genere avec succes");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de generation");
    }
  };

  const onRegeneratePlatform = async () => {
    if (!campaignId || !platformToRegenerate)
      return toast.error("Selectionnez une plateforme");
    try {
      await regeneratePlatform(campaignId, {
        platform: platformToRegenerate,
        instruction: platformInstruction.trim() || undefined,
      });
      toast.success(`Posts ${platformToRegenerate} regeneres`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erreur de regeneration plateforme",
      );
    }
  };

  const onRegeneratePost = async () => {
    if (!campaignId) return;
    const index = Number(postIndexInput);
    if (!Number.isInteger(index) || index < 0)
      return toast.error("Index de post invalide");
    try {
      await regeneratePost(campaignId, {
        index,
        instruction: postInstruction.trim() || undefined,
      });
      toast.success(`Post #${index} regenere`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erreur de regeneration du post",
      );
    }
  };

  const onAutoSchedule = async () => {
    if (!campaignId || !planner.startDate || !planner.endDate) {
      return toast.error("Renseignez startDate et endDate");
    }
    const payload: AutoScheduleCampaignDto = {
      startDate: planner.startDate,
      endDate: planner.endDate,
      frequencyPerWeek: Number(planner.frequencyPerWeek),
      timezone: planner.timezone,
      excludedDays: planner.excludedDays,
      preferredTimeWindows: planner.preferredTimeWindows,
      syncToCalendar: planner.syncToCalendar,
    };
    try {
      await autoScheduleCampaign(campaignId, payload);
      toast.success("Planning automatique genere");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de planification");
    }
  };

  const saveInline = async (postId: string | undefined, index: number) => {
    if (!campaignId) return;
    const draft = drafts[keyFor(postId, index)];
    if (!draft?.date || !draft?.time || !draft?.timezone) {
      return toast.error("Date, heure et timezone sont requises");
    }
    const rowKey = keyFor(postId, index);
    setSavingKey(rowKey);
    try {
      await updateCampaign(campaignId, {
        generatedPosts: [
          { ...(postId ? { postId } : { index }), schedule: draft },
        ],
      });
      toast.success("Horaire mis a jour");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de sauvegarde");
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading && !campaign) return <Skeleton />;

  if (!campaign) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-700">
          Campagne introuvable
        </h1>
        <p className="mt-2 text-sm text-rose-600">
          {error || "Campagne inaccessible."}
        </p>
        <Link
          href="/user/content"
          className="mt-4 inline-flex items-center rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
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
              className="inline-flex items-center text-sm font-medium text-stone-600 hover:text-stone-950"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Retour aux campagnes
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Content operations
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              {campaign.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Genere, planifie et ajuste tes contenus depuis une seule vue.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                router.push(`/calendar?campaignId=${campaign._id}`)
              }
              className="inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Voir dans le calendrier
            </button>
            <Link
              href={`/user/content/new?strategyId=${campaign.strategyId}`}
              className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Nouvelle campagne
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Planification automatique
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Generer un planning automatique
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              type="date"
              value={planner.startDate}
              onChange={(e) =>
                setPlanner((v) => ({ ...v, startDate: e.target.value }))
              }
              className="rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
            />
            <input
              type="date"
              value={planner.endDate}
              onChange={(e) =>
                setPlanner((v) => ({ ...v, endDate: e.target.value }))
              }
              className="rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
            />
            <input
              type="number"
              min={1}
              max={21}
              value={planner.frequencyPerWeek}
              onChange={(e) =>
                setPlanner((v) => ({
                  ...v,
                  frequencyPerWeek: Number(e.target.value || 1),
                }))
              }
              className="rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              value={planner.timezone}
              onChange={(e) =>
                setPlanner((v) => ({ ...v, timezone: e.target.value }))
              }
              className="rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
            />
          </div>
          <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Jours exclus
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const active = planner.excludedDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() =>
                      setPlanner((v) => ({
                        ...v,
                        excludedDays: active
                          ? v.excludedDays.filter((item) => item !== day.key)
                          : [...v.excludedDays, day.key],
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "border border-amber-300 bg-amber-100 text-amber-900" : "border border-stone-300 bg-white text-stone-700"}`}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {campaign.platforms.map((platform) => {
              const key = platformKey(platform);
              return (
                <div
                  key={platform}
                  className="rounded-[24px] border border-stone-200 bg-stone-50/70 p-4"
                >
                  <p className="text-sm font-semibold text-stone-900">
                    {platform}
                  </p>
                  <input
                    type="text"
                    value={(planner.preferredTimeWindows[key] ?? []).join(", ")}
                    onChange={(e) =>
                      setPlanner((v) => ({
                        ...v,
                        preferredTimeWindows: {
                          ...v.preferredTimeWindows,
                          [key]: e.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        },
                      }))
                    }
                    className="mt-3 w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={planner.syncToCalendar}
                onChange={(e) =>
                  setPlanner((v) => ({
                    ...v,
                    syncToCalendar: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-stone-300"
              />
              Synchroniser avec le calendrier
            </label>
            <button
              type="button"
              onClick={onAutoSchedule}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="mr-2 h-4 w-4" />
              )}
              Generer un planning automatique
            </button>
          </div>
        </article>

        <article className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Generation et regeneration
          </h2>
          <textarea
            value={generateInstruction}
            onChange={(e) => setGenerateInstruction(e.target.value)}
            rows={3}
            placeholder="Instruction de generation globale"
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={onGenerate}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-2xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            Generer le contenu
          </button>
          <div className="h-px bg-stone-200" />
          <select
            value={platformToRegenerate}
            onChange={(e) => setPlatformToRegenerate(e.target.value)}
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
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
            onChange={(e) => setPlatformInstruction(e.target.value)}
            rows={2}
            placeholder="Instruction optionnelle plateforme"
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={onRegeneratePlatform}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerer la plateforme
          </button>
          <input
            type="number"
            min={0}
            value={postIndexInput}
            onChange={(e) => setPostIndexInput(e.target.value)}
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
          />
          <textarea
            value={postInstruction}
            onChange={(e) => setPostInstruction(e.target.value)}
            rows={2}
            placeholder="Instruction optionnelle post"
            className="w-full rounded-2xl border border-stone-300 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={onRegeneratePost}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-2xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerer le post
          </button>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-stone-950">
            Calendrier par semaine
          </h2>
          <span className="text-sm text-stone-600">
            {weeks.length} semaine(s)
          </span>
        </div>
        {weeks.length === 0 ? (
          <article className="rounded-[28px] border border-dashed border-stone-300 bg-white p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-stone-400" />
            <h3 className="mt-3 text-lg font-semibold text-stone-950">
              Aucun planning genere
            </h3>
          </article>
        ) : (
          weeks.map((week) => (
            <article
              key={week.weekStart}
              className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm"
            >
              <div className="border-b border-stone-200 bg-stone-50 px-5 py-4 text-sm font-semibold text-stone-900">
                Semaine du {week.weekStart}
              </div>
              <div className="grid gap-px bg-stone-200 lg:grid-cols-7">
                {week.days.map((day) => (
                  <div key={day.date} className="min-h-40 bg-white p-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                      <span>{day.short}</span>
                      <span className="text-sm text-stone-900">
                        {day.date.slice(8, 10)}/{day.date.slice(5, 7)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {day.posts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-stone-200 px-3 py-4 text-center text-xs text-stone-400">
                          Aucun post
                        </div>
                      ) : (
                        day.posts.map((post) => (
                          <div
                            key={keyFor(post._id, post.index)}
                            className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3"
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-stone-900">
                                {post.platform}
                              </span>
                              <span className="text-stone-500">
                                {post.schedule?.time}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-stone-700">
                              {post.caption}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-stone-950">
            Posts et edition inline
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
          </article>
        ) : (
          posts.map((post) => {
            const rowKey = keyFor(post._id, post.index);
            const draft = drafts[rowKey] ?? {
              date: "",
              time: "",
              timezone: planner.timezone,
            };
            return (
              <article
                key={rowKey}
                className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
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
                <div className="mt-5 grid gap-3 rounded-[24px] border border-stone-200 bg-stone-50/80 p-4 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) =>
                      setDrafts((v) => ({
                        ...v,
                        [rowKey]: { ...draft, date: e.target.value },
                      }))
                    }
                    className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm"
                  />
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) =>
                      setDrafts((v) => ({
                        ...v,
                        [rowKey]: { ...draft, time: e.target.value },
                      }))
                    }
                    className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={draft.timezone}
                    onChange={(e) =>
                      setDrafts((v) => ({
                        ...v,
                        [rowKey]: { ...draft, timezone: e.target.value },
                      }))
                    }
                    className="rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => saveInline(post._id, post.index)}
                    disabled={savingKey === rowKey || isSubmitting}
                    className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
                  >
                    {savingKey === rowKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
