import { api, TokenManager } from "@/src/utils/fetcher";
import {
  generateAiMonitoringLogsPdf,
  generateAiMonitoringUsageByUserPdf,
} from "@/src/lib/aiMonitoringPdf";
import type {
  AdminAiLog,
  AdminAiLogsResult,
  AdminAiMonitoringFilters,
  AdminAiOverview,
  AdminAiUsageByFeatureItem,
  AdminAiUsageByUserItem,
  AiFeatureType,
  AiLogStatus,
} from "@/src/types/admin-ai-monitoring.types";

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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const EXPORT_PAGE_SIZE = 100;
const MAX_EXPORT_PAGES = 200;

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

const normalizeUser = (value: unknown): AdminAiLog["user"] => {
  const source = asRecord(value);
  const rawId = source.id ?? source._id;
  const id = typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");
  const fullName = asString(source.fullName);
  const email = asString(source.email);

  if (!id && !fullName && !email) {
    return undefined;
  }

  return {
    id,
    fullName: fullName || "Utilisateur inconnu",
    email: email || "-",
    companyName: asString(source.companyName) || undefined,
    role: asString(source.role) || undefined,
  };
};

const normalizeLog = (value: unknown): AdminAiLog => {
  const source = asRecord(value);
  const rawId = source.id ?? source._id;
  const id = typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

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
      typeof source.responseTimeMs === "number" ? source.responseTimeMs : undefined,
    errorMessage: asString(source.errorMessage) || undefined,
    createdAt,
    updatedAt,
  };
};

const normalizeUsageByFeatureItem = (value: unknown): AdminAiUsageByFeatureItem => {
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

const normalizeUsageByUserItem = (value: unknown): AdminAiUsageByUserItem => {
  const source = asRecord(value);
  const user = normalizeUser(source.user);

  return {
    userId: asString(source.userId),
    user: user ?? {},
    totalRequests: asNumber(source.totalRequests),
    successfulRequests: asNumber(source.successfulRequests),
    failedRequests: asNumber(source.failedRequests),
    successRate: asNumber(source.successRate),
    averageResponseTimeMs: asNumber(source.averageResponseTimeMs),
    lastUsedAt: asIso(source.lastUsedAt),
  };
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

const buildQuery = (filters: AdminAiMonitoringFilters = {}): string => {
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

  if (rawDateFrom && rawDateTo) {
    if (rawDateFrom > rawDateTo) {
      safeDateFrom = rawDateTo;
      safeDateTo = rawDateFrom;
    }
  }

  if (safeDateFrom) params.set("dateFrom", safeDateFrom);
  if (safeDateTo) params.set("dateTo", safeDateTo);
  if (filters.userId?.trim()) params.set("userId", filters.userId.trim());
  if (filters.userSearch?.trim()) params.set("userSearch", filters.userSearch.trim());
  if (filters.featureType) params.set("featureType", filters.featureType);
  if (filters.status) params.set("status", filters.status);
  if (filters.actionType?.trim()) params.set("actionType", filters.actionType.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

export class AdminAiMonitoringService {
  private static buildDateSuffix(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private static withoutPagination(
    filters: AdminAiMonitoringFilters = {},
  ): AdminAiMonitoringFilters {
    return {
      ...filters,
      page: undefined,
      limit: undefined,
    };
  }

  private static async collectLogsForExport(
    filters: AdminAiMonitoringFilters,
  ): Promise<AdminAiLog[]> {
    const logs: AdminAiLog[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      if (page > MAX_EXPORT_PAGES) {
        throw new Error(
          `Export limite a ${MAX_EXPORT_PAGES * EXPORT_PAGE_SIZE} logs. Affinez vos filtres.`,
        );
      }

      const batch = await this.getLogs({
        ...filters,
        page,
        limit: EXPORT_PAGE_SIZE,
      });

      logs.push(...batch.logs);
      totalPages = Math.max(1, batch.totalPages);
      page += 1;
    }

    return logs;
  }

  private static async downloadCsv(endpoint: string, fallbackFileName: string): Promise<void> {
    const token = TokenManager.getAccessToken();
    if (!token) {
      throw new Error("Token d'acces requis");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const payload = (await response.json()) as { message?: string };
        if (payload?.message) {
          errorMessage = payload.message;
        }
      } catch {
        // ignore non-json response
      }

      throw new Error(errorMessage);
    }

    const contentDisposition = response.headers.get("content-disposition") ?? "";
    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    const fileName = fileNameMatch?.[1] || fallbackFileName;

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(blobUrl);
  }

  static async getOverview(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<AdminAiOverview> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/admin/ai-monitoring/overview${query}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response.data) {
      throw new Error(response?.message || "Impossible de recuperer l'overview IA");
    }

    const source = asRecord(response.data);
    const usageByFeature = Array.isArray(source.usageByFeature)
      ? source.usageByFeature.map((item) => normalizeUsageByFeatureItem(item))
      : [];

    const topUsers = Array.isArray(source.topUsers)
      ? source.topUsers.map((item) => normalizeUsageByUserItem(item))
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
      topUsers,
    };
  }

  static async getLogs(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<AdminAiLogsResult> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/admin/ai-monitoring/logs${query}`,
      true,
    )) as ApiEnvelope<RawLogsData>;

    if (!response?.success || !response.data) {
      throw new Error(response?.message || "Impossible de recuperer les logs IA");
    }

    const logsValue = response.data.logs;
    if (!Array.isArray(logsValue)) {
      throw new Error("Reponse logs IA invalide");
    }

    const pagination = asRecord(response.data.pagination);
    const page = asNumber(pagination.page, filters.page ?? 1);
    const limit = asNumber(pagination.limit, filters.limit ?? 20);
    const total = asNumber(pagination.total, 0);

    return {
      logs: logsValue.map((item) => normalizeLog(item)),
      total,
      page,
      limit,
      totalPages: asNumber(pagination.pages, Math.max(1, Math.ceil(total / Math.max(limit, 1)))),
    };
  }

  static async getLogById(logId: string): Promise<AdminAiLog> {
    const response = (await api.get(
      `/admin/ai-monitoring/logs/${logId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response.data) {
      throw new Error(response?.message || "Impossible de recuperer ce log IA");
    }

    return normalizeLog(response.data);
  }

  static async getUsageByFeature(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<AdminAiUsageByFeatureItem[]> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/admin/ai-monitoring/usage-by-feature${query}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !Array.isArray(response.data)) {
      throw new Error(response?.message || "Impossible de recuperer usage by feature");
    }

    return response.data.map((item) => normalizeUsageByFeatureItem(item));
  }

  static async getUsageByUser(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<AdminAiUsageByUserItem[]> {
    const query = buildQuery(filters);
    const response = (await api.get(
      `/admin/ai-monitoring/usage-by-user${query}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !Array.isArray(response.data)) {
      throw new Error(response?.message || "Impossible de recuperer usage by user");
    }

    return response.data.map((item) => normalizeUsageByUserItem(item));
  }

  static async exportLogsCsv(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<void> {
    const query = buildQuery(this.withoutPagination(filters));

    await this.downloadCsv(
      `/admin/ai-monitoring/exports/logs.csv${query}`,
      "ai-monitoring-logs.csv",
    );
  }

  static async exportUsageByUserCsv(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<void> {
    const query = buildQuery(this.withoutPagination(filters));

    await this.downloadCsv(
      `/admin/ai-monitoring/exports/usage-by-user.csv${query}`,
      "ai-monitoring-usage-by-user.csv",
    );
  }

  static async exportUserLogsCsv(
    userId: string,
    filters: AdminAiMonitoringFilters = {},
  ): Promise<void> {
    const query = buildQuery({
      ...this.withoutPagination(filters),
      userId: undefined,
      userSearch: undefined,
    });

    await this.downloadCsv(
      `/admin/ai-monitoring/exports/users/${userId}/logs.csv${query}`,
      `ai-monitoring-user-${userId}.csv`,
    );
  }

  static async exportLogsPdf(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<void> {
    const preparedFilters = this.withoutPagination(filters);
    const logs = await this.collectLogsForExport(preparedFilters);

    generateAiMonitoringLogsPdf({
      title: "AI Monitoring - Logs Report",
      subtitle: "Export base sur les filtres admin",
      fileName: `ai-monitoring-logs-${this.buildDateSuffix()}.pdf`,
      filters: preparedFilters,
      logs,
    });
  }

  static async exportUsageByUserPdf(
    filters: AdminAiMonitoringFilters = {},
  ): Promise<void> {
    const preparedFilters = this.withoutPagination(filters);
    const items = await this.getUsageByUser({
      ...preparedFilters,
      limit: 200,
    });

    generateAiMonitoringUsageByUserPdf({
      title: "AI Monitoring - Usage by User",
      subtitle: "Export base sur les filtres admin",
      fileName: `ai-monitoring-usage-by-user-${this.buildDateSuffix()}.pdf`,
      filters: preparedFilters,
      items,
    });
  }

  static async exportUserLogsPdf(
    userId: string,
    filters: AdminAiMonitoringFilters = {},
  ): Promise<void> {
    const preparedFilters: AdminAiMonitoringFilters = {
      ...this.withoutPagination(filters),
      userId,
      userSearch: undefined,
    };
    const logs = await this.collectLogsForExport(preparedFilters);
    const displayUser =
      logs[0]?.user?.fullName || logs[0]?.user?.email || userId;

    generateAiMonitoringLogsPdf({
      title: "AI Monitoring - User Logs",
      subtitle: `User: ${displayUser}`,
      fileName: `ai-monitoring-user-${userId}-${this.buildDateSuffix()}.pdf`,
      filters: preparedFilters,
      logs,
    });
  }
}

export default AdminAiMonitoringService;
