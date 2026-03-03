"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { CalendarBoard } from "@/src/components/calendar/CalendarBoard";
import { FiltersBar } from "@/src/components/calendar/FiltersBar";
import { PostModal } from "@/src/components/calendar/PostModal";
import { useCalendar } from "@/src/hooks/useCalendar";
import { calendarService } from "@/src/services/calendarService";
import { contentService } from "@/src/services/contentService";
import type {
  CampaignOption,
  CalendarFilterState,
  CalendarView,
  ScheduledPost,
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
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);

  const {
    posts,
    total,
    isLoading,
    isMutating,
    error,
    setVisibleRange,
    refresh,
    createPost,
    updatePost,
    movePost,
    deletePost,
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

  const matchingCampaigns = useMemo(() => {
    if (!selectedPost?.strategyId) {
      return campaigns;
    }

    return campaigns.filter(
      (campaign) =>
        campaign.strategyId === selectedPost.strategyId ||
        campaign._id === selectedPost.campaignId,
    );
  }, [campaigns, selectedPost]);

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

  const openCreateModal = (dateIso?: string) => {
    setModalMode("create");
    setSelectedPost(null);
    setDraftDate(dateIso ?? new Date().toISOString());
    setIsModalOpen(true);
  };

  const openEditModal = (post: ScheduledPost) => {
    setModalMode("edit");
    setSelectedPost(post);
    setDraftDate(post.scheduledAt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setDraftDate(null);
  };

  const handleMovePost = async (postId: string, scheduledAt: string) => {
    try {
      await movePost(postId, scheduledAt);
      toast.success("Publication deplacee");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur lors du deplacement",
      );
      throw requestError;
    }
  };

  const handleCreatePost = async (
    payload: Parameters<typeof createPost>[0],
  ) => {
    try {
      await createPost(payload);
      toast.success("Publication planifiee");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur lors de la creation",
      );
      throw requestError;
    }
  };

  const handleUpdatePost = async (
    id: string,
    payload: Parameters<typeof updatePost>[1],
  ) => {
    try {
      await updatePost(id, payload);
      toast.success("Publication mise a jour");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur lors de la mise a jour",
      );
      throw requestError;
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      toast.success("Publication supprimee");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Erreur lors de la suppression",
      );
      throw requestError;
    }
  };

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
              Metricool style planner
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              Calendrier de publications
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Organise, deplace et ajuste tes publications depuis une vue
              mensuelle ou hebdomadaire. Chaque changement reste synchronise
              avec ton backend NestJS.
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

      <FiltersBar
        filters={filters}
        totalCount={total}
        onPlatformChange={(platform) =>
          setFilters((current) => ({ ...current, platform }))
        }
        onStatusChange={(status) =>
          setFilters((current) => ({ ...current, status }))
        }
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        onViewChange={(view: CalendarView) =>
          setFilters((current) => ({ ...current, view }))
        }
        onCreateClick={() => openCreateModal()}
      />

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

      <CalendarBoard
        posts={scopedPosts}
        view={filters.view}
        isLoading={isLoading}
        onRangeChange={(range) => {
          void setVisibleRange(range);
        }}
        onEventClick={openEditModal}
        onCreateAtDate={openCreateModal}
        onMovePost={handleMovePost}
        onRefresh={refresh}
      />

      {campaignIdFilter ? (
        <section className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Timeline campagne
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                Planning detaille
              </h2>
            </div>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700">
              {campaignTimeline.length} publication(s)
            </span>
          </div>

          {campaignTimeline.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
              Aucun post planifie pour cette campagne sur la plage visible.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {campaignTimeline.map((post) => (
                <article
                  key={post._id}
                  className="rounded-[24px] border border-stone-200 bg-stone-50/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-950 px-2.5 py-1 text-xs font-semibold text-white">
                        {post.platform}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
                        {post.postType}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
                        {post.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-950">
                        {new Date(post.scheduledAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-stone-500">{post.timezone}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-700">
                    {post.caption}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <PostModal
        open={isModalOpen}
        mode={modalMode}
        post={selectedPost}
        draftDate={draftDate}
        strategies={strategies}
        campaigns={selectedPost ? matchingCampaigns : campaigns}
        onClose={closeModal}
        onCreate={handleCreatePost}
        onUpdate={handleUpdatePost}
        onDelete={handleDeletePost}
      />

      {isMutating ? (
        <div className="fixed bottom-5 right-5 z-40 inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-lg">
          <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-stone-950" />
          Synchronisation...
        </div>
      ) : null}
    </div>
  );
}
