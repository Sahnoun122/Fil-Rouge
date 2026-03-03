"use client";

import { CalendarDays, ListFilter, Plus, Search } from "lucide-react";
import { PlatformBadge } from "@/src/components/calendar/PlatformBadge";
import {
  CALENDAR_PLATFORMS,
  SCHEDULED_POST_STATUSES,
  type CalendarFilterState,
  type CalendarPlatform,
  type CalendarView,
  type ScheduledPostStatus,
} from "@/src/types/calendar.types";

interface FiltersBarProps {
  filters: CalendarFilterState;
  totalCount: number;
  onPlatformChange: (value: CalendarPlatform | "all") => void;
  onStatusChange: (value: ScheduledPostStatus | "all") => void;
  onSearchChange: (value: string) => void;
  onViewChange: (value: CalendarView) => void;
  onCreateClick: () => void;
}

const viewOptions: Array<{ label: string; value: CalendarView }> = [
  { label: "Month", value: "dayGridMonth" },
  { label: "Week", value: "timeGridWeek" },
];

const statusLabels: Record<ScheduledPostStatus, string> = {
  planned: "Planned",
  published: "Published",
  late: "Late",
};

export function FiltersBar({
  filters,
  totalCount,
  onPlatformChange,
  onStatusChange,
  onSearchChange,
  onViewChange,
  onCreateClick,
}: FiltersBarProps) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white/90 p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur xl:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Planning editor
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-950">
              Calendar orchestration
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {totalCount} publication{totalCount > 1 ? "s" : ""} chargee
              {totalCount > 1 ? "s" : ""} sur la plage visible.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-100 p-1">
            {viewOptions.map((option) => {
              const isActive = filters.view === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onViewChange(option.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-stone-950 text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.5fr)_200px_180px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={filters.search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by title, caption, hashtags..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white focus:ring-4 focus:ring-stone-200/60"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4">
            <CalendarDays className="h-4 w-4 text-stone-500" />
            <select
              value={filters.platform}
              onChange={(event) =>
                onPlatformChange(event.target.value as CalendarPlatform | "all")
              }
              className="h-12 w-full bg-transparent text-sm font-medium text-stone-900 outline-none"
            >
              <option value="all">All platforms</option>
              {CALENDAR_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4">
            <ListFilter className="h-4 w-4 text-stone-500" />
            <select
              value={filters.status}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as ScheduledPostStatus | "all",
                )
              }
              className="h-12 w-full bg-transparent text-sm font-medium text-stone-900 outline-none"
            >
              <option value="all">All status</option>
              {SCHEDULED_POST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-950 px-5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Planifier un post
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
            Theme: beige / black / white
          </span>
          {filters.platform !== "all" ? (
            <PlatformBadge platform={filters.platform} size="sm" />
          ) : null}
          {filters.status !== "all" ? (
            <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700">
              {statusLabels[filters.status]}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
