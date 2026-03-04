"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  LayoutTemplate,
  Sparkles,
  Tags,
  TextQuote,
} from "lucide-react";
import { calendarService } from "@/src/services/calendarService";
import { contentService } from "@/src/services/contentService";
import type { ScheduledPost } from "@/src/types/calendar.types";
import type { ContentCampaign, GeneratedPost } from "@/src/types/content.types";

function normalizeRouteParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return value?.trim() || "";
}

function toIsoRange(date: string, endOfDay = false) {
  return new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`).toISOString();
}

function formatSchedule(date?: string, time?: string) {
  if (!date || !time) {
    return "Non planifie";
  }

  return `${date} a ${time}`;
}

function formatStatusLabel(status?: ScheduledPost["status"]) {
  if (status === "published") return "Publie";
  if (status === "late") return "En retard";
  return "Planifie";
}

function formatPostTypeLabel(value?: string | null) {
  if (!value) {
    return "post";
  }

  return value;
}

function resolveRange(campaign: ContentCampaign) {
  const scheduledDates = campaign.generatedPosts
    .map((post) => post.schedule?.date)
    .filter((value): value is string => Boolean(value))
    .sort();

  const startDate =
    campaign.inputs?.startDate || scheduledDates[0] || new Date().toISOString().slice(0, 10);
  const endDate =
    campaign.inputs?.endDate ||
    scheduledDates[scheduledDates.length - 1] ||
    startDate;

  return {
    rangeStart: toIsoRange(startDate),
    rangeEnd: toIsoRange(endDate, true),
  };
}

function matchScheduledPost(
  campaignId: string,
  index: number,
  generatedPost: GeneratedPost,
  posts: ScheduledPost[],
) {
  const noteSignature = `AUTO_SCHEDULE:${campaignId}:${index}`;

  return (
    posts.find((post) => post.notes?.trim() === noteSignature) ||
    posts.find(
      (post) =>
        post.campaignId === campaignId &&
        post.platform.toLowerCase() === generatedPost.platform.toLowerCase() &&
        post.caption.trim() === generatedPost.caption.trim(),
    ) ||
    null
  );
}

function matchGeneratedPostFromScheduledPost(
  campaign: ContentCampaign,
  scheduledPost: ScheduledPost,
) {
  const noteMatch = /^AUTO_SCHEDULE:[^:]+:(\d+)$/.exec(
    scheduledPost.notes?.trim() || "",
  );

  if (noteMatch) {
    const index = Number(noteMatch[1]);
    if (Number.isInteger(index) && index >= 0) {
      return {
        generatedPost: campaign.generatedPosts[index] ?? null,
        resolvedIndex: campaign.generatedPosts[index] ? index : null,
      };
    }
  }

  const matchedIndex = campaign.generatedPosts.findIndex(
    (post) =>
      post.platform.toLowerCase() === scheduledPost.platform.toLowerCase() &&
      post.caption.trim() === scheduledPost.caption.trim(),
  );

  if (matchedIndex >= 0) {
    return {
      generatedPost: campaign.generatedPosts[matchedIndex] ?? null,
      resolvedIndex: matchedIndex,
    };
  }

  return { generatedPost: null, resolvedIndex: null as number | null };
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-24 animate-pulse rounded-[22px] border border-stone-200 bg-stone-100" />
        <div className="h-24 animate-pulse rounded-[22px] border border-stone-200 bg-stone-100" />
        <div className="h-24 animate-pulse rounded-[22px] border border-stone-200 bg-stone-100" />
        <div className="h-24 animate-pulse rounded-[22px] border border-stone-200 bg-stone-100" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="h-80 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
        <div className="h-80 animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
      </div>
    </div>
  );
}

export default function CampaignPlanningDetailPage() {
  const params = useParams<{ campaignId: string | string[]; index: string | string[] }>();
  const campaignId = normalizeRouteParam(params.campaignId);
  const postKey = normalizeRouteParam(params.index);
  const fallbackIndex =
    /^\d+$/.test(postKey) && Number.isInteger(Number(postKey))
      ? Number(postKey)
      : null;
  const [campaign, setCampaign] = useState<ContentCampaign | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [directScheduledPost, setDirectScheduledPost] = useState<ScheduledPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidRoute, setIsInvalidRoute] = useState(false);

  useEffect(() => {
    if (!campaignId && !postKey) {
      return;
    }

    if (!campaignId || !postKey) {
      setIsInvalidRoute(true);
      setIsLoading(false);
      return;
    }

    const loadDetail = async () => {
      setIsLoading(true);
      setIsInvalidRoute(false);

      try {
        const loadedCampaign = await contentService.getCampaign(campaignId);
        setCampaign(loadedCampaign);
        setDirectScheduledPost(null);

        const { rangeStart, rangeEnd } = resolveRange(loadedCampaign);
        const response = await calendarService.listPosts({ rangeStart, rangeEnd, limit: 200 });
        const campaignPosts = response.posts.filter(
          (post) => post.campaignId === loadedCampaign._id,
        );
        setScheduledPosts(campaignPosts);

        const hasGeneratedPostById = loadedCampaign.generatedPosts.some(
          (post) => post._id?.trim() === postKey,
        );

        if (!hasGeneratedPostById && postKey && fallbackIndex === null) {
          try {
            const scheduledPost = await calendarService.getPost(postKey);
            if (scheduledPost.campaignId === loadedCampaign._id) {
              setDirectScheduledPost(scheduledPost);
              if (!campaignPosts.some((post) => post._id === scheduledPost._id)) {
                setScheduledPosts((current) => [...current, scheduledPost]);
              }
            }
          } catch {
            setDirectScheduledPost(null);
          }
        }
      } catch (requestError) {
        toast.error(
          requestError instanceof Error
            ? requestError.message
            : "Erreur lors du chargement du planning",
        );
        setCampaign(null);
        setScheduledPosts([]);
        setDirectScheduledPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [campaignId, postKey]);

  const resolvedPost = useMemo(() => {
    if (!campaign || !postKey) {
      return { generatedPost: null, resolvedIndex: null as number | null };
    }

    const byId = campaign.generatedPosts.findIndex(
      (post) => post._id?.trim() === postKey,
    );
    if (byId >= 0) {
      return {
        generatedPost: campaign.generatedPosts[byId] ?? null,
        resolvedIndex: byId,
      };
    }

    if (fallbackIndex !== null && fallbackIndex >= 0) {
      return {
        generatedPost: campaign.generatedPosts[fallbackIndex] ?? null,
        resolvedIndex: fallbackIndex,
      };
    }

    const scheduledPostById =
      scheduledPosts.find((post) => post._id === postKey) || directScheduledPost;
    if (scheduledPostById) {
      return matchGeneratedPostFromScheduledPost(campaign, scheduledPostById);
    }

    return { generatedPost: null, resolvedIndex: null as number | null };
  }, [campaign, directScheduledPost, fallbackIndex, postKey, scheduledPosts]);

  const { generatedPost, resolvedIndex } = resolvedPost;

  const scheduledPost = useMemo(() => {
    if (directScheduledPost) {
      return directScheduledPost;
    }

    if (!generatedPost || !campaign || resolvedIndex === null) {
      return null;
    }

    return matchScheduledPost(
      campaign._id,
      resolvedIndex,
      generatedPost,
      scheduledPosts,
    );
  }, [campaign, directScheduledPost, generatedPost, resolvedIndex, scheduledPosts]);

  const detailTitle =
    generatedPost?.title ||
    generatedPost?.hook ||
    scheduledPost?.title ||
    `Publication ${generatedPost?.platform || scheduledPost?.platform || ""}`.trim() ||
    "Publication";
  const detailCaption = generatedPost?.caption || scheduledPost?.caption || "";
  const detailDescription = generatedPost?.description || null;
  const detailCta = generatedPost?.cta || null;
  const detailHashtags = generatedPost?.hashtags || scheduledPost?.hashtags || [];
  const detailPlatform = generatedPost?.platform || scheduledPost?.platform || "-";
  const detailType = generatedPost?.type || scheduledPost?.postType || "post";
  const detailTimezone =
    generatedPost?.schedule?.timezone || scheduledPost?.timezone || "UTC";
  const detailDate = generatedPost?.schedule?.date || null;
  const detailTime = generatedPost?.schedule?.time || null;

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isInvalidRoute || !campaign || (!generatedPost && !scheduledPost)) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-xl font-bold text-rose-700">Planning introuvable</h1>
        <p className="mt-2 text-sm text-rose-600">
          Ce planning n est plus disponible dans cette campagne.
        </p>
        <Link
          href={campaignId ? `/calendar?campaignId=${campaignId}` : "/calendar"}
          className="mt-4 inline-flex items-center rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour calendrier
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

      <section className="overflow-hidden rounded-[30px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(245,247,250,0.98)_38%,_rgba(229,231,235,0.92)_100%)] p-6 shadow-[0_26px_70px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Link
              href={`/calendar?campaignId=${campaign._id}`}
              className="inline-flex items-center text-sm font-medium text-stone-600 transition hover:text-stone-950"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Retour au calendrier
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Planning detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {detailTitle}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Detail professionnel du planning avec son contenu editorial et son slot de publication.
            </p>
          </div>

          <div className="rounded-[22px] border border-cyan-200 bg-cyan-50/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Campagne
            </p>
            <p className="mt-1 text-base font-semibold text-stone-950">
              {campaign.name}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <CalendarClock className="h-3.5 w-3.5" />
            Planification
          </p>
          <p className="mt-2 text-base font-semibold text-stone-950">
            {formatSchedule(detailDate ?? undefined, detailTime ?? undefined)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {detailTimezone}
          </p>
        </article>

        <article className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <Globe2 className="h-3.5 w-3.5" />
            Plateforme
          </p>
          <p className="mt-2 text-base font-semibold text-stone-950">
            {detailPlatform}
          </p>
        </article>

        <article className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Type
          </p>
          <p className="mt-2 text-base font-semibold text-stone-950">
            {formatPostTypeLabel(detailType)}
          </p>
        </article>

        <article className="rounded-[22px] border border-stone-200 bg-white p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Statut
          </p>
          <p className="mt-2 text-base font-semibold text-stone-950">
            {formatStatusLabel(scheduledPost?.status)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              Contenu de la publication
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {detailTitle}
            </h2>
          </div>

          {generatedPost?.hook ? (
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Hook
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-cyan-950">
                {generatedPost.hook}
              </p>
            </div>
          ) : null}

          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              <TextQuote className="h-3.5 w-3.5" />
              Caption
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
              {detailCaption || "Aucun caption disponible"}
            </p>
          </div>

          {detailDescription ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {detailDescription}
              </p>
            </div>
          ) : null}

          {detailCta ? (
            <div className="rounded-[18px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                CTA
              </p>
              <p className="mt-2 text-sm font-medium text-stone-800">
                {detailCta}
              </p>
            </div>
          ) : null}
        </article>

        <aside className="space-y-4">
          <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              <Clock3 className="h-3.5 w-3.5" />
              Resume du planning
            </p>
            <dl className="mt-4 space-y-3 text-sm text-stone-700">
              <div className="flex items-start justify-between gap-4">
                <dt>Date</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {detailDate || "Non definie"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Heure</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {detailTime || "Non definie"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Timezone</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {detailTimezone}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Etat calendrier</dt>
                <dd className="text-right font-semibold text-stone-950">
                  {formatStatusLabel(scheduledPost?.status)}
                </dd>
              </div>
            </dl>

            {scheduledPost?._id ? (
              <Link
                href={`/calendar/planning/${scheduledPost._id}`}
                className="mt-4 inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
              >
                Ouvrir la fiche calendrier
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            ) : null}
          </article>

          <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              <Tags className="h-3.5 w-3.5" />
              Hashtags
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {detailHashtags.length > 0 ? (
                detailHashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">Aucun hashtag</span>
              )}
            </div>
          </article>

          {(generatedPost?.suggestedVisual || scheduledPost?.notes) ? (
            <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                <FileText className="h-3.5 w-3.5" />
                Notes
              </p>

              {generatedPost?.suggestedVisual ? (
                <div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Suggestion visuelle
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    {generatedPost.suggestedVisual}
                  </p>
                </div>
              ) : null}

              {scheduledPost?.notes ? (
                <div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Notes techniques
                  </p>
                  <p className="mt-2 break-all text-sm leading-6 text-stone-600">
                    {scheduledPost.notes}
                  </p>
                </div>
              ) : null}
            </article>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
