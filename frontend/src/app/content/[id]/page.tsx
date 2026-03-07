"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  Hash,
  Loader2,
  MessageSquare,
  MonitorPlay,
  RefreshCcw,
  Sparkles,
  Target,
  Type,
  Zap,
} from "lucide-react";

const platformColorMap: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  tiktok: "bg-slate-900 text-white",
  facebook: "bg-blue-100 text-blue-700",
  linkedin: "bg-blue-50 text-blue-800",
  youtube: "bg-red-100 text-red-700",
  pinterest: "bg-red-50 text-red-600",
  x: "bg-slate-800 text-white",
  snapchat: "bg-yellow-100 text-yellow-700",
  threads: "bg-slate-100 text-slate-700",
};

function getPlatformClass(platform: string) {
  return platformColorMap[platform.toLowerCase()] ?? "bg-slate-100 text-slate-700";
}
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
    return "Not scheduled";
  }

  return `${schedule.date} ${schedule.time}`;
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PostWithIndex = ContentCampaign["generatedPosts"][number] & { index: number };

function PostCard({ post, mode }: { post: PostWithIndex; mode: string }) {
  const [expanded, setExpanded] = useState(false);
  const isAds = mode === "ADS";

  const hasExtras =
    post.hook ||
    post.description ||
    post.cta ||
    post.suggestedVisual ||
    (post.hashtags && post.hashtags.length > 0) ||
    (isAds && (post.adCopyVariantA || post.adCopyVariantB || post.adCopyVariantC));

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {post.index}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${getPlatformClass(post.platform)}`}>
            {post.platform}
          </span>
          {post.type && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-600">
              <MonitorPlay className="h-3 w-3" />
              {post.type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">{scheduleText(post.schedule)}</span>
          {hasExtras && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Collapse" : "Details"}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-4 space-y-4">
        {/* Title */}
        {post.title && (
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Title</span>
            </div>
            <p className="text-base font-bold text-slate-900">{post.title}</p>
          </div>
        )}

        {/* Caption */}
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Caption</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.caption}</p>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && hasExtras && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 space-y-4">
          {/* Hook */}
          {post.hook && (
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hook</span>
              </div>
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm font-medium italic text-amber-900">
                &ldquo;{post.hook}&rdquo;
              </p>
            </div>
          )}

          {/* Description */}
          {post.description && (
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{post.description}</p>
            </div>
          )}

          {/* CTA */}
          {post.cta && (
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Call to Action</span>
              </div>
              <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                {post.cta}
              </span>
            </div>
          )}

          {/* Ad copy variants (ADS mode) */}
          {isAds && (post.adCopyVariantA || post.adCopyVariantB || post.adCopyVariantC) && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">A/B/C Variants</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "A — Emotion", value: post.adCopyVariantA, color: "border-purple-100 bg-purple-50 text-purple-900" },
                  { label: "B — Benefit", value: post.adCopyVariantB, color: "border-blue-100 bg-blue-50 text-blue-900" },
                  { label: "C — Urgency", value: post.adCopyVariantC, color: "border-rose-100 bg-rose-50 text-rose-900" },
                ].map(({ label, value, color }) =>
                  value ? (
                    <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider opacity-60">{label}</p>
                      <p className="text-sm leading-6">{value}</p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Suggested visual */}
          {post.suggestedVisual && (
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <MonitorPlay className="h-3.5 w-3.5 text-cyan-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested visual</span>
              </div>
              <p className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-2.5 text-sm text-cyan-800">
                {post.suggestedVisual}
              </p>
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-44 animate-pulse rounded-[28px] border border-slate-200 bg-linear-to-r from-slate-100 to-slate-50" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100" />
      <div className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100" />
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
  const [aiTab, setAiTab] = useState<"global" | "platform" | "post">("global");

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
      toast.success("Content generated successfully");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Generation error",
      );
    }
  };

  const handleRegeneratePlatform = async () => {
    if (!campaignId || !platformToRegenerate) {
      toast.error("Select a platform");
      return;
    }

    try {
      await regeneratePlatform(campaignId, {
        platform: platformToRegenerate,
        instruction: platformInstruction.trim() || undefined,
      });
      toast.success(`${platformToRegenerate} posts regenerated`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Platform regeneration error",
      );
    }
  };

  const handleRegeneratePost = async () => {
    if (!campaignId) return;
    const index = Number(postIndexInput);

    if (!Number.isInteger(index) || index < 0) {
      toast.error("Invalid post index");
      return;
    }

    try {
      await regeneratePost(campaignId, {
        index,
        instruction: postInstruction.trim() || undefined,
      });
      toast.success(`Post #${index} regenerated`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Post regeneration error",
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
      toast.success("Schedule generated. Redirecting to calendar...");
      router.push(`/calendar?campaignId=${campaign._id}`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Error generating schedule",
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
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-700">Campaign not found</h1>
        <p className="mt-2 text-sm text-rose-600">
          {error || "This campaign is no longer accessible."}
        </p>
        <Link
          href="/user/content"
          className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
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
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "14px",
          },
        }}
      />

      {/* Hero section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <Link
              href="/user/content"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to campaigns
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Content campaign
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {campaign.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {campaign.mode}
              </span>
              {campaign.platforms.map((platform) => (
                <span
                  key={platform}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getPlatformClass(platform)}`}
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={`/user/content/new?strategyId=${campaign.strategyId}`}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            New campaign
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
            <Hash className="h-4 w-4 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Generated posts</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">{posts.length}</p>
          </div>
        </article>
        <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Scheduled</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">{scheduledCount}</p>
          </div>
        </article>
        <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
            <Zap className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Frequency / week</p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900">
              {campaign.campaignSummary?.postingPlan?.frequencyPerWeek ?? "-"}
            </p>
          </div>
        </article>
        <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Last updated</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatDateTime(campaign.updatedAt)}</p>
          </div>
        </article>
      </section>

      {/* Planning section */}
      <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-linear-to-r from-cyan-50/80 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">
              Automatic scheduling
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Generate schedule and work in the calendar
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              A single click applies scheduling heuristics,
              saves the schedules and syncs with the calendar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGeneratePlanning}
              disabled={isScheduling || isSubmitting}
              className="inline-flex items-center rounded-xl bg-linear-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isScheduling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="mr-2 h-4 w-4" />
              )}
              Generate schedule
            </button>
            <button
              type="button"
              onClick={() => router.push(`/calendar?campaignId=${campaign._id}`)}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Open calendar
            </button>
          </div>
        </div>
      </section>

      {/* AI Actions - tabbed panel */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/60">
          {([
            { id: "global", label: "Generate", icon: Bot },
            { id: "platform", label: "By platform", icon: RefreshCcw },
            { id: "post", label: "By post", icon: FileText },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAiTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                aiTab === id
                  ? "border-b-2 border-cyan-500 bg-white text-cyan-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {aiTab === "global" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global generation</p>
                <p className="mt-0.5 text-sm text-slate-500">Generates all posts for all selected platforms.</p>
              </div>
              <textarea
                value={generateInstruction}
                onChange={(event) => setGenerateInstruction(event.target.value)}
                rows={3}
                placeholder="Optional instruction (e.g., focus on mobile conversion)…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-xl bg-linear-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-slate-700 hover:to-slate-800 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Generate content
              </button>
            </div>
          )}

          {aiTab === "platform" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Regenerate a platform</p>
                <p className="mt-0.5 text-sm text-slate-500">Regenerates all posts for a specific platform.</p>
              </div>
              <select
                value={platformToRegenerate}
                onChange={(event) => setPlatformToRegenerate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">Select a platform</option>
                {campaign.platforms.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              <textarea
                value={platformInstruction}
                onChange={(event) => setPlatformInstruction(event.target.value)}
                rows={2}
                placeholder="Optional instruction for this platform…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
              />
              <button
                type="button"
                onClick={handleRegeneratePlatform}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                Regenerate platform
              </button>
            </div>
          )}

          {aiTab === "post" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Regenerate a post</p>
                <p className="mt-0.5 text-sm text-slate-500">Regenerates an individual post by its index (starts at 0).</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Post index</label>
                <input
                  type="number"
                  min={0}
                  value={postIndexInput}
                  onChange={(event) => setPostIndexInput(event.target.value)}
                  className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <textarea
                value={postInstruction}
                onChange={(event) => setPostInstruction(event.target.value)}
                rows={2}
                placeholder="Optional instruction for this post…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
              />
              <button
                type="button"
                onClick={handleRegeneratePost}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                Regenerate post
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Posts section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Campaign posts</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {posts.length} post{posts.length > 1 ? "s" : ""}
          </span>
        </div>

        {error ? (
          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </article>
        ) : null}

        {posts.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No generated posts</h3>
            <p className="mt-1 text-sm text-slate-500">
              Start a global generation to fill this campaign.
            </p>
          </article>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id || `${post.platform}-${post.index}`} post={post} mode={campaign.mode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
