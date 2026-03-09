import { api } from "@/src/utils/fetcher";
import type {
  AiFeatureType,
  AiLogStatus,
  UserAiLog,
  UserAiLogsResult,
  UserAiMonitoringFilters,
  UserAiOverview,
  UserAiUsageByFeatureItem,
  UserAiUsageOverTimePoint,
} from "@/src/types/user-ai-monitoring.types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type RawLogsData = {
  logs?: unknown;
  pagination?: unknown;
};

const FEATURE_TYPES: AiFeatureType[] = ["strategy", "swot", "content", "planning"];
const LOG_STATUSES: AiLogStatus[] = ["success", "failed"];

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const asIso = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

const normalizePositiveInt = (
  value: unknown,
  min: number,
  max: number,
): number | undefined => {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

const normalizeDateForQuery = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(normalized)) {
    return normalized;
  }

  const localPattern = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
  const localMatch = normalized.match(localPattern);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
};

const normalizeFeatureType = (value: unknown): AiFeatureType => {
  return FEATURE_TYPES.includes(value as AiFeatureType)
    ? (value as AiFeatureType)
    : "content";
};

const normalizeLogStatus = (value: unknown): AiLogStatus => {
  return LOG_STATUSES.includes(value as AiLogStatus)
    ? (value as AiLogStatus)
    : "failed";
};

const buildQuery = (filters: UserAiMonitoringFilters = {}): string => {
  const params = new URLSearchParams();

  const safePage = normalizePositiveInt(filters.page, 1, 1000000);
  if (safePage) {
    params.set("page", String(safePage));
  }

  const safeLimit = normalizePositiveInt(filters.limit, 1, 100);
  if (safeLimit) {
    params.set("limit", String(safeLimit));
  }

  const rawDateFrom = normalizeDateForQuery(filters.dateFrom);
  const rawDateTo = normalizeDateForQuery(filters.dateTo);
  let safeDateFrom = rawDateFrom;
  let safeDateTo = rawDateTo;

  if (rawDateFrom && rawDateTo && rawDateFrom > rawDateTo) {
    safeDateFrom = rawDateTo;
    safeDateTo = rawDateFrom;
  }

  if (safeDateFrom) params.set("dateFrom", safeDateFrom);
  if (safeDateTo) params.set("dateTo", safeDateTo);
  if (filters.featureType) params.set("featureType", filters.featureType);
  if (filters.status) params.set("status", filters.status);
  if (filters.actionType?.trim()) params.set("actionType", filters.actionType.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

const normalizeUser = (value: unknown): UserAiLog["user"] => {
  const source = asRecord(value);
  const rawId = source.id ?? source._id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");
  const fullName = asString(source.fullName);
  const email = asString(source.email);

  if (!id && !fullName && !email) {
    return undefined;
  }

  return {
    id,
    fullName: fullName || "Utilisateur",
    email: email || "-",
    companyName: asString(source.companyName) || undefined,
    role: asString(source.role) || undefined,
  };
};

const normalizeLog = (value: unknown): UserAiLog => {
  const source = asRecord(value);
  const rawId = source.id ?? source._id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

  const userSource = normalizeUser(source.userId);
  const userId = userSource?.id || asString(source.userId) || "";
  const createdAt = asIso(source.createdAt) || new Date().toISOString();
  const updatedAt = asIso(source.updatedAt) || createdAt;

  return {
    id,
    userId,
    user: userSource,
    featureType: normalizeFeatureType(source.featureType),
    actionType: asString(source.actionType, "unknown"),
    relatedEntityId: asString(source.relatedEntityId) || undefined,
    status: normalizeLogStatus(source.status),
    inputSummary: asString(source.inputSummary) || undefined,
    responseSummary: asString(source.responseSummary) || undefined,
    modelName: asString(source.modelName) || undefined,
    responseTimeMs:
      typeof source.responseTimeMs === "number"
        ? source.responseTimeMs
        : undefined,
    errorMessage: asString(source.errorMessage) || undefined,
    createdAt,
    updatedAt,
  };
};

const normalizeUsageByFeatureItem = (
  value: unknown,
): UserAiUsageByFeatureItem => {
  const source = asRecord(value);

  return {
    featureType: normalizeFeatureType(source.featureType),
    totalRequests: asNumber(source.totalRequests),
    successfulRequests: asNumber(source.successfulRequests),
    failedRequests: asNumber(source.failedRequests),
    successRate: asNumber(source.successRate),
    averageResponseTimeMs: asNumber(source.averageResponseTimeMs),
    lastUsedAt: asIso(source.lastUsedAt),
  };
};

const normalizeUsageOverTimeItem = (value: unknown): UserAiUsageOverTimePoint => {
  const source = asRecord(value);
  const rawDate = asString(source.date);
  const isoDate = normalizeDateForQuery(rawDate) || rawDate;

  return {
    date: isoDate,
    totalRequests: asNumber(source.totalRequests),
    successfulRequests: asNumber(source.successfulRequests),
    failedRequests: asNumber(source.failedRequests),
    averageResponseTimeMs: asNumber(source.averageResponseTimeMs),
  };
};

export class UserAiMonitoringService {
  static async getOverview(
    filters: UserAiMonitoringFilters = {},
  ): Promise<UserAiOverview> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/ai-monitoring/overview${query}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response.data) {
      throw new Error(
        response?.message || "Impossible de recuperer vos statistiques IA",
      );
    }

    const source = asRecord(response.data);
    const usageByFeature = Array.isArray(source.usageByFeature)
      ? source.usageByFeature.map((item) => normalizeUsageByFeatureItem(item))
      : [];

    return {
      totalRequests: asNumber(source.totalRequests),
      successfulRequests: asNumber(source.successfulRequests),
      failedRequests: asNumber(source.failedRequests),
      successRate: asNumber(source.successRate),
      averageResponseTimeMs: asNumber(source.averageResponseTimeMs),
      uniqueUsers: asNumber(source.uniqueUsers),
      latestRequestAt: asIso(source.latestRequestAt),
      usageByFeature,
    };
  }

  static async getLogs(
    filters: UserAiMonitoringFilters = {},
  ): Promise<UserAiLogsResult> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/ai-monitoring/logs${query}`,
      true,
    )) as ApiEnvelope<RawLogsData>;

    if (!response?.success || !response.data) {
      throw new Error(response?.message || "Impossible de recuperer vos logs IA");
    }

    const logsValue = response.data.logs;
    if (!Array.isArray(logsValue)) {
      throw new Error("Reponse logs IA invalide");
    }

    const pagination = asRecord(response.data.pagination);
    const page = asNumber(pagination.page, filters.page ?? 1);
    const limit = asNumber(pagination.limit, filters.limit ?? 10);
    const total = asNumber(pagination.total, 0);

    return {
      logs: logsValue.map((item) => normalizeLog(item)),
      total,
      page,
      limit,
      totalPages: asNumber(
        pagination.pages,
        Math.max(1, Math.ceil(total / Math.max(limit, 1))),
      ),
    };
  }

  static async getLogById(logId: string): Promise<UserAiLog> {
    const response = (await api.get(
      `/ai-monitoring/logs/${logId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response.data) {
      throw new Error(response?.message || "Impossible de recuperer ce log IA");
    }

    return normalizeLog(response.data);
  }

  static async getUsageByFeature(
    filters: UserAiMonitoringFilters = {},
  ): Promise<UserAiUsageByFeatureItem[]> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/ai-monitoring/usage-by-feature${query}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !Array.isArray(response.data)) {
      throw new Error(
        response?.message || "Impossible de recuperer l'usage par feature",
      );
    }

    return response.data.map((item) => normalizeUsageByFeatureItem(item));
  }

  static async getUsageOverTime(
    filters: UserAiMonitoringFilters = {},
  ): Promise<UserAiUsageOverTimePoint[]> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/ai-monitoring/usage-over-time${query}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !Array.isArray(response.data)) {
      throw new Error(
        response?.message || "Impossible de recuperer l'usage dans le temps",
      );
    }

    return response.data.map((item) => normalizeUsageOverTimeItem(item));
  }
}

export default UserAiMonitoringService;
