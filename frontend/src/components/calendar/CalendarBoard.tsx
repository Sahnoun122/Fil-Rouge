"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { PlatformBadge } from "@/src/components/calendar/PlatformBadge";
import type {
  CalendarRange,
  CalendarView,
  ScheduledPost,
} from "@/src/types/calendar.types";

interface CalendarBoardProps {
  posts: ScheduledPost[];
  view: CalendarView;
  isLoading: boolean;
  onRangeChange: (range: CalendarRange) => void;
  onEventClick: (post: ScheduledPost) => void;
  onCreateAtDate: (dateIso?: string) => void;
  onMovePost: (postId: string, scheduledAt: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const formatTitlePreview = (post: ScheduledPost) =>
  post.title?.trim() || post.caption.trim() || "Untitled post";

export function CalendarBoard({
  posts,
  view,
  isLoading,
  onRangeChange,
  onEventClick,
  onCreateAtDate,
  onMovePost,
  onRefresh,
}: CalendarBoardProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [calendarTitle, setCalendarTitle] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) {
      return;
    }

    if (calendarApi.view.type !== view) {
      calendarApi.changeView(view);
    }
  }, [view]);

  const events = useMemo<EventInput[]>(
    () =>
      posts.map((post) => ({
        id: post._id,
        title: formatTitlePreview(post),
        start: post.scheduledAt,
        end: post.scheduledAt,
        allDay: false,
        editable: true,
        extendedProps: {
          post,
        },
      })),
    [posts],
  );

  const handleDatesSet = (arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);

    const adjustedEnd = new Date(arg.end.getTime() - 1);
    onRangeChange({
      rangeStart: arg.start.toISOString(),
      rangeEnd: adjustedEnd.toISOString(),
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderEventContent = (arg: EventContentArg) => {
    const post = arg.event.extendedProps.post as ScheduledPost;

    return (
      <div className="calendar-chip flex w-full items-start gap-2 rounded-2xl border border-stone-200 bg-white/95 px-2.5 py-2 text-left shadow-sm">
        <div className="pt-0.5 text-stone-300">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <PlatformBadge platform={post.platform} size="sm" compact />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              {arg.timeText}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-4 text-stone-800">
            {formatTitlePreview(post)}
          </p>
        </div>
      </div>
    );
  };

  const goToPrevious = () => calendarRef.current?.getApi().prev();
  const goToNext = () => calendarRef.current?.getApi().next();
  const goToToday = () => calendarRef.current?.getApi().today();

  return (
    <section className="calendar-shell rounded-[32px] border border-stone-200 bg-[#f8f2e8] p-4 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 rounded-[28px] border border-stone-200 bg-white/80 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Visual planner
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-stone-950">
            {calendarTitle}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-stone-200 bg-white p-2 sm:p-3">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          locale={frLocale}
          firstDay={1}
          headerToolbar={false}
          height="auto"
          editable
          dayMaxEventRows={4}
          weekends
          nowIndicator
          selectable
          eventStartEditable
          eventDurationEditable={false}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          events={events}
          datesSet={handleDatesSet}
          dateClick={(arg: DateClickArg) =>
            onCreateAtDate(arg.date.toISOString())
          }
          eventClick={(arg: EventClickArg) =>
            onEventClick(arg.event.extendedProps.post as ScheduledPost)
          }
          eventDrop={async (arg: EventDropArg) => {
            try {
              await onMovePost(
                arg.event.id,
                arg.event.start?.toISOString() ?? new Date().toISOString(),
              );
            } catch {
              arg.revert();
            }
          }}
          eventContent={renderEventContent}
        />

        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f8f2e8]/72 backdrop-blur-[2px]">
            <div className="w-full max-w-xl rounded-[28px] border border-stone-200 bg-white/95 p-5 shadow-lg">
              <div className="mb-4 h-5 w-40 animate-pulse rounded-full bg-stone-200" />
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 14 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-stone-100"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {!isLoading && posts.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 rounded-[24px] border border-dashed border-stone-300 bg-white/95 p-6 text-center shadow-sm">
            <p className="text-lg font-semibold text-stone-900">
              Aucune publication sur cette plage
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Change les filtres, navigue sur une autre periode ou cree un
              nouveau post.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
