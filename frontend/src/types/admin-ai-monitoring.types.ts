export type AiFeatureType = "strategy" | "swot" | "content" | "planning";
export type AiLogStatus = "success" | "failed";

export interface AdminAiMonitoringFilters {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  userSearch?: string;
  featureType?: AiFeatureType;
  status?: AiLogStatus;
  actionType?: string;
}

export interface AdminAiUserSummary {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  role?: string;
}

export interface AdminAiLog {
  id: string;
  userId: string;
  user?: AdminAiUserSummary;
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

export interface AdminAiLogsResult {
  logs: AdminAiLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminAiUsageByFeatureItem {
  featureType: AiFeatureType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  lastUsedAt?: string;
}

export interface AdminAiUsageByUserItem {
  userId: string;
  user: Partial<AdminAiUserSummary>;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  lastUsedAt?: string;
}

export interface AdminAiOverview {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  uniqueUsers: number;
  latestRequestAt?: string;
  usageByFeature: AdminAiUsageByFeatureItem[];
  topUsers: AdminAiUsageByUserItem[];
}

export interface UsageOverTimePoint {
  date: string;
  label: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}
