export type AiFeatureType = "strategy" | "swot" | "content" | "planning";
export type AiLogStatus = "success" | "failed";

export interface UserAiMonitoringFilters {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  featureType?: AiFeatureType;
  status?: AiLogStatus;
  actionType?: string;
}

export interface UserAiSummary {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  role?: string;
}

export interface UserAiLog {
  id: string;
  userId: string;
  user?: UserAiSummary;
  featureType: AiFeatureType;
  actionType: string;
  relatedEntityId?: string;
  status: AiLogStatus;
  inputSummary?: string;
  responseSummary?: string;
  modelName?: string;
  responseTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAiLogsResult {
  logs: UserAiLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserAiUsageByFeatureItem {
  featureType: AiFeatureType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  lastUsedAt?: string;
}

export interface UserAiUsageOverTimePoint {
  date: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
}

export interface UserAiOverview {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  uniqueUsers: number;
  latestRequestAt?: string;
  usageByFeature: UserAiUsageByFeatureItem[];
}
