export const CALENDAR_PLATFORMS = [
  "instagram",
  "tiktok",
  "facebook",
  "linkedin",
  "youtube",
  "pinterest",
] as const;

export const SCHEDULED_POST_TYPES = [
  "post",
  "reel",
  "story",
  "tiktok",
  "video",
  "carousel",
  "ad",
] as const;

export const SCHEDULED_POST_STATUSES = [
  "planned",
  "published",
  "late",
] as const;

export const CALENDAR_VIEWS = ["dayGridMonth", "timeGridWeek"] as const;

export type CalendarPlatform = (typeof CALENDAR_PLATFORMS)[number];
export type ScheduledPostType = (typeof SCHEDULED_POST_TYPES)[number];
export type ScheduledPostStatus = (typeof SCHEDULED_POST_STATUSES)[number];
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export interface ScheduledPost {
  _id: string;
  userId: string;
  strategyId?: string | null;
  campaignId?: string | null;
  platform: CalendarPlatform;
  postType: ScheduledPostType;
  title?: string | null;
  caption: string;
  hashtags: string[];
  mediaUrls?: string[];
  scheduledAt: string;
  status: ScheduledPostStatus;
  timezone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ScheduledPostsResponse {
  posts: ScheduledPost[];
  total: number;
  pagination?: CalendarPagination;
}

export interface CalendarRange {
  rangeStart: string;
  rangeEnd: string;
}

export interface ListScheduledPostsParams extends CalendarRange {
  platform?: CalendarPlatform;
  status?: ScheduledPostStatus;
  page?: number;
  limit?: number;
}

export interface CreateScheduledPostDto {
  strategyId?: string;
  campaignId?: string;
  platform: CalendarPlatform;
  postType: ScheduledPostType;
  title?: string;
  caption: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledAt: string;
  status?: ScheduledPostStatus;
  timezone: string;
  notes?: string;
}

export interface UpdateScheduledPostDto {
  strategyId?: string;
  campaignId?: string;
  platform?: CalendarPlatform;
  postType?: ScheduledPostType;
  title?: string;
  caption?: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledAt?: string;
  status?: ScheduledPostStatus;
  timezone?: string;
  notes?: string;
}

export interface MoveScheduledPostDto {
  scheduledAt: string;
}

export interface CalendarFilterState {
  platform: CalendarPlatform | "all";
  status: ScheduledPostStatus | "all";
  search: string;
  view: CalendarView;
}

export interface StrategyOption {
  _id: string;
  businessInfo: {
    businessName: string;
    industry?: string;
  };
}

export interface CampaignOption {
  _id: string;
  strategyId: string;
  name: string;
  platforms: string[];
}
