"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import type {
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
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
  CalendarRange,
  StrategyOption,
} from "@/src/types/calendar.types";
import type { ContentCampaign } from "@/src/types/content.types";

const initialFilters: CalendarFilterState = {
  platform: "all",
  status: "all",
  search: "",
  view: "dayGridMonth",
};

const SCHEDULED_STATUS_LABELS: Record<string, string> = {
  planned: "Planifie",
  published: "Publie",
  late: "En retard",
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateKey(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toIsoRange(date: string, endOfDay = false) {
  const dateKey = normalizeDateKey(date) ?? getTodayDateKey();
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    ),
  ).toISOString();
}

function getCurrentMonthRange(): CalendarRange {
  const now = new Date();
  const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));

  return {
    rangeStart: firstDay.toISOString(),
    rangeEnd: new Date(
      Date.UTC(
        lastDay.getUTCFullYear(),
        lastDay.getUTCMonth(),
        lastDay.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    ).toISOString(),
  };
}

function buildCampaignRange(campaign: ContentCampaign): CalendarRange {
  const today = getTodayDateKey();
  const scheduledDates = campaign.generatedPosts
    .map((post) => normalizeDateKey(post.schedule?.date))
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right));

  const preferredEndDate =
    normalizeDateKey(campaign.inputs?.endDate) ||
    scheduledDates[scheduledDates.length - 1] ||
    today;
  const endDate = preferredEndDate < today ? today : preferredEndDate;

  return {
    rangeStart: toIsoRange(today),
    rangeEnd: toIsoRange(endDate, true),
  };
}

function parseScheduleParts(date: string, time: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());

  if (!dateMatch || !timeMatch) {
    return null;
  }

  return {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };
}

function getDatePartsInTimezone(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const values = new Map<string, string>();

  for (const part of parts) {
    if (part.type !== "literal") {
      values.set(part.type, part.value);
    }
  }

  return {
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    minute: Number(values.get("minute")),
  };
}

function isScheduleInFutureInTimezone(
  date: string,
  time: string,
  timezone: string,
): boolean {
  const scheduleDate = zonedDateTimeToUtc(date, time, timezone);
  if (!scheduleDate) {
    return false;
  }

  return scheduleDate.getTime() > Date.now();
}

function zonedDateTimeToUtc(
  date: string,
  time: string,
  timezone: string,
): Date | null {
  const target = parseScheduleParts(date, time);
  if (!target) {
    return null;
  }

  try {
    let utcMillis = Date.UTC(
      target.year,
      target.month - 1,
      target.day,
      target.hour,
      target.minute,
    );

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const zonedParts = getDatePartsInTimezone(new Date(utcMillis), timezone);
      const zonedAsUtc = Date.UTC(
        zonedParts.year,
        zonedParts.month - 1,
        zonedParts.day,
        zonedParts.hour,
        zonedParts.minute,
      );
      const targetAsUtc = Date.UTC(
        target.year,
        target.month - 1,
        target.day,
        target.hour,
        target.minute,
      );
      const diff = zonedAsUtc - targetAsUtc;
      if (diff === 0) {
        break;
      }
      utcMillis -= diff;
    }

    return new Date(utcMillis);
  } catch {
    return null;
  }
}

function formatScheduleDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

function formatScheduleLabel(date?: string, time?: string): string {
  if (!date || !time) {
    return "Non planifie";
  }

  return `${formatScheduleDate(date)} a ${time}`;
}

function normalizeStatusLabel(status?: string): string {
  if (!status) {
    return "Planifie";
  }

  return SCHEDULED_STATUS_LABELS[status.toLowerCase()] ?? status;
}

function normalizePostTypeLabel(value?: string | null): string {
  const normalized = value?.trim();
  if (!normalized) {
    return "post";
  }

  return normalized.toLowerCase();
}

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planningCalendarRef = useRef<FullCalendar | null>(null);
  const campaignIdFilter = searchParams.get("campaignId")?.trim() || "";
  const [filters, setFilters] = useState<CalendarFilterState>(initialFilters);
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignDetail, setCampaignDetail] = useState<ContentCampaign | null>(
    null,
  );
  const [isMetaLoading, setIsMetaLoading] = useState(true);

  const { posts, total, isLoading, isMutating, error, setVisibleRange } =
    useCalendar(filters);

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
      setCampaignDetail(null);

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
    if (!campaignIdFilter) {
      void setVisibleRange(getCurrentMonthRange());
      return;
    }

    if (!campaignDetail) {
      return;
    }

    void setVisibleRange(buildCampaignRange(campaignDetail));
  }, [campaignDetail, campaignIdFilter, setVisibleRange]);

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
        const scheduleSignature = `AUTO_SCHEDULE:${campaignIdFilter}:${index}`;
        const matchingScheduledPost =
          scopedPosts.find(
            (scheduledPost) =>
              scheduledPost.notes?.trim() === scheduleSignature,
          ) ??
          scopedPosts.find(
            (scheduledPost) =>
              scheduledPost.caption.trim() === post.caption.trim() &&
              scheduledPost.platform.toLowerCase() ===
                post.platform.toLowerCase(),
          );

        const timezone =
          post.schedule?.timezone ||
          matchingScheduledPost?.timezone ||
          campaignTimeline[0]?.timezone ||
          "UTC";
        const isScheduleFuture =
          Boolean(post.schedule?.date) &&
          Boolean(post.schedule?.time) &&
          isScheduleInFutureInTimezone(
            post.schedule?.date || "",
            post.schedule?.time || "",
            timezone,
          );

        const rawScheduleDateTime =
          isScheduleFuture && post.schedule?.time
            ? (zonedDateTimeToUtc(
                post.schedule?.date || "",
                post.schedule?.time || "",
                timezone,
              ) ??
              new Date(
                `${post.schedule?.date || ""}T${post.schedule?.time || ""}:00`,
              ))
            : null;

        const scheduleDateTime =
          rawScheduleDateTime && !Number.isNaN(rawScheduleDateTime.getTime())
            ? rawScheduleDateTime
            : null;

        return {
          ...post,
          index,
          postType: normalizePostTypeLabel(
            post.type || matchingScheduledPost?.postType || "post",
          ),
          scheduledPostId: matchingScheduledPost?._id ?? null,
          detailHref: campaignIdFilter
            ? `/calendar/planning/campaign/${campaignIdFilter}/${post._id || index}`
            : null,
          scheduleLabel:
            isScheduleFuture && post.schedule?.time
              ? formatScheduleLabel(post.schedule?.date, post.schedule?.time)
              : "Non planifie (slot deja passe)",
          scheduleDateTime,
          scheduleDate: isScheduleFuture ? (post.schedule?.date ?? null) : null,
          scheduleTime: isScheduleFuture ? (post.schedule?.time ?? null) : null,
          status: matchingScheduledPost?.status ?? "planned",
          timezone,
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
  }, [campaignDetail, campaignIdFilter, campaignTimeline, scopedPosts]);

  const planningEvents = useMemo<EventInput[]>(() => {
    return planningCards
      .filter(
        (post) => Boolean(post.scheduleDateTime) && Boolean(post.detailHref),
      )
      .map((post) => ({
        id:
          post.scheduledPostId ||
          `${campaignIdFilter}-${post._id || post.index}`,
        title: post.title?.trim() || post.caption.trim() || "Publication",
        start: post.scheduleDateTime?.toISOString(),
        allDay: false,
        extendedProps: {
          detailHref: post.detailHref,
          platform: post.platform,
          postType: post.postType,
          timezone: post.timezone,
        },
      }));
  }, [campaignIdFilter, planningCards]);

  const handlePlanningEventClick = useCallback(
    (arg: EventClickArg) => {
      const detailHref = (arg.event.extendedProps as { detailHref?: string })
        .detailHref;
      if (detailHref) {
        router.push(detailHref);
      }
    },
    [router],
  );

  const renderPlanningEvent = useCallback((arg: EventContentArg) => {
    const { platform, postType } = arg.event.extendedProps as {
      platform?: string;
      postType?: string;
    };

    return (
      <div className="w-full rounded-xl border border-stone-200 bg-white/95 px-2.5 py-2 text-left shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
            {arg.timeText} {platform ? `- ${platform}` : ""}
          </p>
          <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-stone-700">
            {normalizePostTypeLabel(postType)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-stone-800">
          {arg.event.title}
        </p>
      </div>
    );
  }, []);

  useEffect(() => {
    const calendarApi = planningCalendarRef.current?.getApi();
    if (!calendarApi) {
      return;
    }

    if (calendarApi.view.type !== filters.view) {
      calendarApi.changeView(filters.view);
    }
  }, [filters.view]);

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
              Consulte les plannings de campagne sous forme de cards editoriales
              avec les contenus generes par l IA et leurs slots de publication.
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
              {planningCards.filter((post) => post.scheduleDateTime).length}
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

      {campaignIdFilter ? (
        <section className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Vue calendrier
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                Date et heure des publications
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Clique sur une publication pour ouvrir sa page detail.
              </p>
            </div>

            <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-100 p-1">
              {[
                { label: "Mois", value: "dayGridMonth" as const },
                { label: "Semaine", value: "timeGridWeek" as const },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      view: option.value,
                    }))
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filters.view === option.value
                      ? "bg-stone-950 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-[24px] border border-stone-200 bg-[#f8f2e8] p-3">
            {planningEvents.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
                Aucune publication planifiee avec date et heure.
              </div>
            ) : (
              <FullCalendar
                ref={planningCalendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={filters.view}
                locale={frLocale}
                firstDay={1}
                headerToolbar={false}
                height="auto"
                nowIndicator
                events={planningEvents}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
                eventClick={handlePlanningEventClick}
                eventContent={renderPlanningEvent}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
              />
            )}

            {isLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f8f2e8]/70 backdrop-blur-[2px]">
                <div className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-sm">
                  Chargement du calendrier...
                </div>
              </div>
            ) : null}
          </div>
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
              Chaque campagne affiche maintenant une vue calendrier
              professionnelle avec la date, l heure de publication et l acces
              direct au detail de chaque post.
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
                          {post.postType}
                        </span>
                        <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
                          {normalizeStatusLabel(post.status)}
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
                        <p className="text-xs text-stone-500">
                          {post.timezone}
                          {post.scheduleDate && post.scheduleTime
                            ? ` - ${post.scheduleDate} ${post.scheduleTime}`
                            : ""}
                        </p>
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

                    <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500">
                        Details du planning
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-950 px-3 py-1.5 text-[11px] font-semibold text-white">
                        Voir le detail
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
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
