"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, X } from "lucide-react";
import type {
  CampaignOption,
  CalendarPlatform,
  CreateScheduledPostDto,
  ScheduledPost,
  ScheduledPostStatus,
  ScheduledPostType,
  StrategyOption,
  UpdateScheduledPostDto,
} from "@/src/types/calendar.types";
import {
  CALENDAR_PLATFORMS,
  SCHEDULED_POST_STATUSES,
  SCHEDULED_POST_TYPES,
} from "@/src/types/calendar.types";

const postSchema = z.object({
  strategyId: z.string().optional(),
  campaignId: z.string().optional(),
  platform: z.enum(CALENDAR_PLATFORMS),
  postType: z.enum(SCHEDULED_POST_TYPES),
  title: z.string().max(160, "160 caracteres maximum").optional(),
  caption: z.string().min(1, "La caption est obligatoire").max(5000),
  hashtags: z.string().optional(),
  mediaUrls: z.string().optional(),
  scheduledAt: z.string().min(1, "La date et l heure sont obligatoires"),
  status: z.enum(SCHEDULED_POST_STATUSES),
  timezone: z.string().min(1, "Le fuseau horaire est obligatoire").max(100),
  notes: z.string().max(2000, "2000 caracteres maximum").optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

const statusLabels: Record<ScheduledPostStatus, string> = {
  planned: "Planned",
  published: "Published",
  late: "Late",
};

const postTypeLabels: Record<ScheduledPostType, string> = {
  post: "Post",
  reel: "Reel",
  story: "Story",
  tiktok: "TikTok",
  video: "Video",
  carousel: "Carousel",
  ad: "Ad",
};

const platformLabels: Record<CalendarPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  pinterest: "Pinterest",
};

const normalizeTextareaList = (value?: string) =>
  (value ?? "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const pad = (value: number) => value.toString().padStart(2, "0");

const formatDateTimeLocal = (value?: string) => {
  const date = value ? new Date(value) : new Date();

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const defaultTimezone =
  typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Casablanca"
    : "Africa/Casablanca";

interface PostModalProps {
  open: boolean;
  mode: "create" | "edit";
  post: ScheduledPost | null;
  draftDate?: string | null;
  strategies: StrategyOption[];
  campaigns: CampaignOption[];
  onClose: () => void;
  onCreate: (payload: CreateScheduledPostDto) => Promise<void>;
  onUpdate: (id: string, payload: UpdateScheduledPostDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PostModal({
  open,
  mode,
  post,
  draftDate,
  strategies,
  campaigns,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: PostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      strategyId: "",
      campaignId: "",
      platform: "instagram",
      postType: "post",
      title: "",
      caption: "",
      hashtags: "",
      mediaUrls: "",
      scheduledAt: formatDateTimeLocal(draftDate ?? undefined),
      status: "planned",
      timezone: defaultTimezone,
      notes: "",
    },
  });

  const selectedStrategyId = watch("strategyId");
  const selectedCampaignId = watch("campaignId");

  const filteredCampaigns = useMemo(() => {
    if (!selectedStrategyId) {
      return campaigns;
    }

    return campaigns.filter(
      (campaign) => campaign.strategyId === selectedStrategyId,
    );
  }, [campaigns, selectedStrategyId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && post) {
      reset({
        strategyId: post.strategyId ?? "",
        campaignId: post.campaignId ?? "",
        platform: post.platform,
        postType: post.postType,
        title: post.title ?? "",
        caption: post.caption,
        hashtags: (post.hashtags ?? []).join(", "),
        mediaUrls: (post.mediaUrls ?? []).join("\n"),
        scheduledAt: formatDateTimeLocal(post.scheduledAt),
        status: post.status,
        timezone: post.timezone || defaultTimezone,
        notes: post.notes ?? "",
      });
      return;
    }

    reset({
      strategyId: "",
      campaignId: "",
      platform: "instagram",
      postType: "post",
      title: "",
      caption: "",
      hashtags: "",
      mediaUrls: "",
      scheduledAt: formatDateTimeLocal(draftDate ?? undefined),
      status: "planned",
      timezone: defaultTimezone,
      notes: "",
    });
  }, [draftDate, mode, open, post, reset]);

  useEffect(() => {
    if (!selectedCampaignId) {
      return;
    }

    const campaignStillAvailable = filteredCampaigns.some(
      (campaign) => campaign._id === selectedCampaignId,
    );

    if (!campaignStillAvailable) {
      setValue("campaignId", "");
    }
  }, [filteredCampaigns, selectedCampaignId, setValue]);

  const handleDelete = async () => {
    if (!post) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(post._id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const submit = async (values: PostFormValues) => {
    setIsSubmitting(true);

    const payload: CreateScheduledPostDto = {
      strategyId: values.strategyId?.trim() || undefined,
      campaignId: values.campaignId?.trim() || undefined,
      platform: values.platform,
      postType: values.postType,
      title: values.title?.trim() || undefined,
      caption: values.caption.trim(),
      hashtags: normalizeTextareaList(values.hashtags),
      mediaUrls: normalizeTextareaList(values.mediaUrls),
      scheduledAt: new Date(values.scheduledAt).toISOString(),
      status: values.status,
      timezone: values.timezone.trim(),
      notes: values.notes?.trim() || undefined,
    };

    try {
      if (mode === "edit" && post) {
        await onUpdate(post._id, payload);
      } else {
        await onCreate(payload);
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-stone-200 bg-[#f8f2e8] shadow-[0_30px_120px_-40px_rgba(15,23,42,0.65)]">
        <div className="flex items-start justify-between border-b border-stone-200 bg-white/70 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {mode === "edit" ? "Edit post" : "Create post"}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-stone-950">
              {mode === "edit" ? "Edit Post" : "Planifier un post"}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Gere la date, la plateforme, le contenu et les notes internes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-stone-200 bg-white p-2 text-stone-500 transition hover:text-stone-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="max-h-[calc(92vh-88px)] overflow-y-auto"
        >
          <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Platform
                  </label>
                  <select
                    {...register("platform")}
                    className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                  >
                    {CALENDAR_PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platformLabels[platform]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Post type
                  </label>
                  <select
                    {...register("postType")}
                    className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                  >
                    {SCHEDULED_POST_TYPES.map((postType) => (
                      <option key={postType} value={postType}>
                        {postTypeLabels[postType]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Strategy
                  </label>
                  <select
                    {...register("strategyId")}
                    className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                  >
                    <option value="">Aucune</option>
                    {strategies.map((strategy) => (
                      <option key={strategy._id} value={strategy._id}>
                        {strategy.businessInfo.businessName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Campaign
                  </label>
                  <select
                    {...register("campaignId")}
                    className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                  >
                    <option value="">Aucune</option>
                    {filteredCampaigns.map((campaign) => (
                      <option key={campaign._id} value={campaign._id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Title
                </label>
                <input
                  {...register("title")}
                  placeholder="Ex: Reel teasing lancement produit"
                  className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                />
                {errors.title ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Caption
                </label>
                <textarea
                  {...register("caption")}
                  rows={6}
                  placeholder="Renseigne la caption complete du post..."
                  className="w-full rounded-3xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                />
                {errors.caption ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.caption.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Hashtags
                  </label>
                  <textarea
                    {...register("hashtags")}
                    rows={4}
                    placeholder="#launch, #creator, #growth"
                    className="w-full rounded-3xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Media URLs
                  </label>
                  <textarea
                    {...register("mediaUrls")}
                    rows={4}
                    placeholder="Une URL par ligne ou separee par des virgules"
                    className="w-full rounded-3xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                  />
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[28px] border border-stone-200 bg-white p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Scheduling
                </h4>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Date + time
                    </label>
                    <input
                      type="datetime-local"
                      {...register("scheduledAt")}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                    />
                    {errors.scheduledAt ? (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors.scheduledAt.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Timezone
                    </label>
                    <input
                      {...register("timezone")}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                    />
                    {errors.timezone ? (
                      <p className="mt-1 text-xs text-rose-600">
                        {errors.timezone.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">
                      Status
                    </label>
                    <select
                      {...register("status")}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                    >
                      {SCHEDULED_POST_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-white p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Internal notes
                </h4>
                <textarea
                  {...register("notes")}
                  rows={6}
                  placeholder="Consignes equipe, variations creatives, livrables manquants..."
                  className="mt-4 w-full rounded-3xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-200/70"
                />
                {errors.notes ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.notes.message}
                  </p>
                ) : null}
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-stone-950 p-5 text-stone-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Reminder
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-200">
                  Le drag and drop mettra a jour directement la date planifiee
                  depuis le board.
                </p>
              </div>
            </aside>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white/70 px-6 py-4">
            <div>
              {mode === "edit" && post ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="inline-flex items-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="inline-flex items-center rounded-2xl bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {mode === "edit" ? "Save changes" : "Create post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
