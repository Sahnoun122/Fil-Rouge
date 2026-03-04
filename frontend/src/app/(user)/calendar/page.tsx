"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import {
  ArrowUpRight,
  CalendarClock,
  Sparkles,
  Tags,
  TextQuote,
} from "lucide-react";
import { useCalendar } from "@/src/hooks/useCalendar";
import { calendarService } from "@/src/services/calendarService";
import { contentService } from "@/src/services/contentService";
import type {
  CampaignOption,
  CalendarFilterState,
  StrategyOption,
} from "@/src/types/calendar.types";
import type { ContentCampaign } from "@/src/types/content.types";

const initialFilters: CalendarFilterState = {
  platform: "all",
  status: "all",
  search: "",
  view: "dayGridMonth",
};

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const campaignIdFilter = searchParams.get("campaignId")?.trim() || "";
  const [filters, setFilters] = useState<CalendarFilterState>(initialFilters);
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignDetail, setCampaignDetail] = useState<ContentCampaign | null>(
    null,
  );
  const [isMetaLoading, setIsMetaLoading] = useState(true);

  const {
    posts,
    total,
    isMutating,
    error,
    refresh,
  } = useCalendar(filters);

  useEffect(() => {
    const loadMeta = async () => {
      setIsMetaLoading(true);

      try {
        const [loadedStrategies, loadedCampaigns] = await Promise.all([
          calendarService.listStrategies(),
          calendarService.listCampaigns(),
        ]);

        setStrategies(loadedStrategies);
        setCampaigns(loadedCampaigns);
      } catch (requestError) {
        toast.error(
          requestError instanceof Error
            ? requestError.message
            : "Erreur lors du chargement des references",
        );
      } finally {
        setIsMetaLoading(false);
      }
    };

    void loadMeta();
  }, []);

  useEffect(() => {
    if (!campaignIdFilter) {
      setCampaignDetail(null);
      return;
    }

    const loadCampaignDetail = async () => {
      try {
        const loadedCampaign =
          await contentService.getCampaign(campaignIdFilter);
        setCampaignDetail(loadedCampaign);
      } catch (requestError) {
        toast.error(
          requestError instanceof Error
            ? requestError.message
            : "Erreur lors du chargement de la campagne",
        );
        setCampaignDetail(null);
      }
    };

    void loadCampaignDetail();
  }, [campaignIdFilter]);

  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error(error);
  }, [error]);

  const scopedPosts = useMemo(() => {
    if (!campaignIdFilter) {
      return posts;
    }

    return posts.filter((post) => post.campaignId === campaignIdFilter);
  }, [campaignIdFilter, posts]);

  const scopedCampaigns = useMemo(() => {
    if (!campaignIdFilter) {
      return campaigns;
    }

    return campaigns.filter((campaign) => campaign._id === campaignIdFilter);
  }, [campaignIdFilter, campaigns]);

  const campaignTimeline = useMemo(
    () =>
      [...scopedPosts].sort(
        (left, right) =>
          new Date(left.scheduledAt).getTime() -
          new Date(right.scheduledAt).getTime(),
      ),
    [scopedPosts],
  );

  const planningCards = useMemo(() => {
    if (!campaignDetail) {
      return [];
    }

    return [...campaignDetail.generatedPosts]
      .map((post, index) => {
        const matchingScheduledPost = scopedPosts.find(
          (scheduledPost) =>
            scheduledPost.caption.trim() === post.caption.trim() &&
            scheduledPost.platform.toLowerCase() ===
              post.platform.toLowerCase(),
        );

        const scheduleDateTime =
          post.schedule?.date && post.schedule?.time
            ? new Date(`${post.schedule.date}T${post.schedule.time}:00`)
            : null;

        return {
          ...post,
          index,
          scheduledPostId: matchingScheduledPost?._id ?? null,
          detailHref: campaignIdFilter
            ? `/calendar/planning/campaign/${campaignIdFilter}/${index}`
            : null,
          scheduleLabel:
            post.schedule?.date && post.schedule?.time
              ? `${post.schedule.date} a ${post.schedule.time}`
              : "Non planifie",
          scheduleDateTime,
          status: matchingScheduledPost?.status ?? "draft",
          timezone:
            post.schedule?.timezone ||
            matchingScheduledPost?.timezone ||
            campaignTimeline[0]?.timezone ||
            "UTC",
        };
      })
      .sort((left, right) => {
        if (!left.scheduleDateTime && !right.scheduleDateTime) {
          return left.index - right.index;
        }

        if (!left.scheduleDateTime) {
          return 1;
        }

        if (!right.scheduleDateTime) {
          return -1;
        }

        return (
          left.scheduleDateTime.getTime() - right.scheduleDateTime.getTime()
        );
      });
  }, [campaignDetail, campaignTimeline, scopedPosts]);

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

      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_rgba(248,242,232,0.95)_40%,_rgba(231,229,228,0.85)_100%)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Planning editorial
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              Planning de contenu
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Consulte les plannings de campagne sous forme de cards
              editoriales avec les contenus generes par l IA et leurs slots de
              publication.
            </p>
            {campaignIdFilter ? (
              <div className="mt-4 rounded-[22px] border border-cyan-200 bg-cyan-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Campagne active
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  {campaignDetail?.name || "Chargement de la campagne..."}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {campaignDetail?.platforms?.join(", ") ||
                    "Filtre campagne actif"}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-[28px] border border-stone-200 bg-white/70 p-4 text-sm text-stone-700 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Visible
              </p>
              <p className="mt-1 text-2xl font-semibold text-stone-950">
                {scopedPosts.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Loaded
              </p>
              <p className="mt-1 text-2xl font-semibold text-stone-950">
                {campaignIdFilter ? scopedPosts.length : total}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Refs
              </p>
              <p className="mt-1 text-2xl font-semibold text-stone-950">
                {isMetaLoading
                  ? "..."
                  : `${strategies.length}/${campaigns.length}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {campaignIdFilter ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Campagne
            </p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">
              {campaignDetail?.name || "..."}
            </p>
          </article>
          <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Posts planifies
            </p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">
              {scopedPosts.length}
            </p>
          </article>
          <article className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Plateformes
            </p>
            <p className="mt-3 text-2xl font-semibold text-stone-950">
              {campaignDetail?.platforms?.length ??
                scopedCampaigns[0]?.platforms?.length ??
                0}
            </p>
          </article>
        </section>
      ) : null}

      {!campaignIdFilter ? (
        <section className="rounded-[32px] border border-stone-200 bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Vue campagne
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Ouvre une campagne pour voir son planning detaille
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              La grande vue calendrier a ete retiree. Le planning se consulte
              maintenant depuis les cards de campagne pour un rendu plus propre
              et plus professionnel.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.slice(0, 12).map((campaign) => (
              <Link
                key={campaign._id}
                href={`/calendar?campaignId=${campaign._id}`}
                className="group rounded-[24px] border border-stone-200 bg-stone-50/70 p-5 transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-stone-950">
                      {campaign.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {campaign.platforms.join(", ") || "Sans plateforme"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700">
                    Ouvrir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {campaignIdFilter ? (
        <section className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Planning IA
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                Cartes editoriales du planning
              </h2>
            </div>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700">
              {planningCards.length} carte(s)
            </span>
          </div>

          {planningCards.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
              Aucun planning disponible pour cette campagne.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {planningCards.map((post) => (
                <Link
                  key={post._id || `${post.platform}-${post.index}`}
                  href={
                    post.detailHref ||
                    (post.scheduledPostId
                      ? `/calendar/planning/${post.scheduledPostId}`
                      : "#")
                  }
                  className="group overflow-hidden rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)]"
                >
                  <div className="border-b border-stone-200 bg-stone-50/90 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-stone-950 px-2.5 py-1 text-xs font-semibold text-white">
                          {post.platform}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
                          {post.type || "post"}
                        </span>
                        <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
                          {post.status}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition group-hover:border-stone-300 group-hover:text-stone-950">
                        Ouvrir
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Slot planning
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">
                          {post.scheduleLabel}
                        </p>
                        <p className="text-xs text-stone-500">{post.timezone}</p>
                      </div>
                      {(post.hashtags ?? []).length > 0 ? (
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                          {(post.hashtags ?? []).length} tag(s)
                        </span>
                      ) : null}
                    </div>

                    {post.title ? (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                          Angle
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-stone-950">
                          {post.title}
                        </p>
                      </div>
                    ) : null}

                    {post.hook ? (
                      <div className="rounded-[18px] border border-cyan-200 bg-cyan-50/80 p-3">
                        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                          <Sparkles className="h-3.5 w-3.5" />
                          Hook IA
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-cyan-950">
                          {post.hook}
                        </p>
                      </div>
                    ) : null}

                    <div>
                      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                        <TextQuote className="h-3.5 w-3.5" />
                        Caption IA
                      </p>
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                        {post.caption}
                      </p>
                    </div>

                    {(post.hashtags ?? []).length > 0 ? (
                      <div>
                        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                          <Tags className="h-3.5 w-3.5" />
                          Hashtags
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.hashtags?.slice(0, 4).map((tag) => (
                            <span
                              key={`${post._id || post.index}-${tag}`}
                              className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700"
                            >
                              #{tag}
                            </span>
                          ))}
                          {(post.hashtags?.length ?? 0) > 4 ? (
                            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                              +{(post.hashtags?.length ?? 0) - 4}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {isMutating ? (
        <div className="fixed bottom-5 right-5 z-40 inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-lg">
          <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-stone-950" />
          Synchronisation...
        </div>
      ) : null}
    </div>
  );
}
