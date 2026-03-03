"use client";

import type { CalendarPlatform } from "@/src/types/calendar.types";

type BadgeSize = "sm" | "md";

interface PlatformMeta {
  label: string;
  shortLabel: string;
  dotClassName: string;
  chipClassName: string;
}

export const PLATFORM_META: Record<CalendarPlatform, PlatformMeta> = {
  instagram: {
    label: "Instagram",
    shortLabel: "IG",
    dotClassName: "bg-pink-500",
    chipClassName: "border-pink-200 bg-pink-50 text-pink-700",
  },
  tiktok: {
    label: "TikTok",
    shortLabel: "TT",
    dotClassName: "bg-slate-900",
    chipClassName: "border-slate-300 bg-slate-100 text-slate-800",
  },
  facebook: {
    label: "Facebook",
    shortLabel: "FB",
    dotClassName: "bg-blue-600",
    chipClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  linkedin: {
    label: "LinkedIn",
    shortLabel: "IN",
    dotClassName: "bg-sky-700",
    chipClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  youtube: {
    label: "YouTube",
    shortLabel: "YT",
    dotClassName: "bg-rose-600",
    chipClassName: "border-rose-200 bg-rose-50 text-rose-700",
  },
  pinterest: {
    label: "Pinterest",
    shortLabel: "PI",
    dotClassName: "bg-red-700",
    chipClassName: "border-red-200 bg-red-50 text-red-700",
  },
};

interface PlatformBadgeProps {
  platform: CalendarPlatform;
  size?: BadgeSize;
  compact?: boolean;
}

export function PlatformBadge({
  platform,
  size = "md",
  compact = false,
}: PlatformBadgeProps) {
  const meta = PLATFORM_META[platform];
  const padding =
    size === "sm" ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.12em] ${meta.chipClassName} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}

export const getPlatformLabel = (platform: CalendarPlatform) =>
  PLATFORM_META[platform].label;
