export type ContentMode = 'ADS' | 'CONTENT_MARKETING';
export type ContentObjective = 'leads' | 'sales' | 'awareness' | 'engagement';

export interface ContentCampaignInputs {
  productOffer?: string;
  targetAudience?: string;
  tone?: string;
  callToAction?: string;
  promoDetails?: string;
  budget?: number;
  contentPillars?: string[];
  frequencyPerWeek?: number;
  startDate?: string;
  endDate?: string;
  platforms?: string[];
}

export interface PostSchedule {
  date: string;
  time: string;
  timezone: string;
}

export interface GeneratedPost {
  _id?: string;
  platform: string;
  type: string;
  title?: string;
  caption: string;
  description?: string;
  hashtags?: string[];
  hook?: string;
  cta?: string;
  adCopyVariantA?: string;
  adCopyVariantB?: string;
  adCopyVariantC?: string;
  suggestedVisual?: string;
  schedule?: PostSchedule;
}

export interface CampaignSummary {
  contentPillars?: string[];
  postingPlan?: {
    frequencyPerWeek?: number;
    durationWeeks?: number;
  };
}

export interface ContentCampaign {
  _id: string;
  strategyId: string;
  mode: ContentMode;
  name: string;
  objective: ContentObjective;
  platforms: string[];
  inputs?: ContentCampaignInputs;
  campaignSummary?: CampaignSummary;
  generatedPosts: GeneratedPost[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ContentCampaignsList {
  campaigns: ContentCampaign[];
  pagination: ContentPagination;
}

export interface CreateContentCampaignDto {
  strategyId: string;
  mode: ContentMode;
  name?: string;
  inputs?: ContentCampaignInputs;
}

export interface UpdateContentCampaignDto {
  name?: string;
  inputs?: ContentCampaignInputs;
  generatedPosts?: Array<{
    postId?: string;
    index?: number;
    schedule: PostSchedule;
  }>;
}

export interface GenerateContentDto {
  instruction?: string;
}

export interface RegeneratePlatformDto {
  platform: string;
  instruction?: string;
}

export interface RegeneratePostDto {
  postId?: string;
  index?: number;
  instruction?: string;
}

export interface PreferredTimeWindowsInput {
  [platform: string]: string[];
}

export interface AutoScheduleCampaignDto {
  startDate: string;
  endDate: string;
  frequencyPerWeek: number;
  timezone: string;
  excludedDays?: string[];
  preferredTimeWindows?: PreferredTimeWindowsInput;
  syncToCalendar?: boolean;
}
