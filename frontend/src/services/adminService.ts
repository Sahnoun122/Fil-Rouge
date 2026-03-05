import { api } from "../utils/fetcher";
import {
  AdminContent,
  AdminContentDetail,
  AdminContentsFilters,
  AdminContentsResult,
  AdminCreateUserPayload,
  AdminStrategiesFilters,
  AdminStrategyDetail,
  AdminStrategiesResult,
  AdminStrategy,
  AdminSwotDetail,
  AdminSwotFilters,
  AdminSwotsResult,
  AdminSwot,
  AdminSwotMatrix,
  AdminUser,
  AdminUserCalendarFilters,
  AdminUserCalendarResult,
  AdminUserRole,
  AdminUserStats,
  AdminUsersFilters,
  AdminUsersResult,
  AdminUpdateUserPayload,
  SetUserBanPayload,
} from "../types/admin.types";
import type { ScheduledPost } from "../types/calendar.types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type RawUsersData = {
  users?: unknown;
  total?: unknown;
  page?: unknown;
  limit?: unknown;
  totalPages?: unknown;
};

type RawStrategiesData = {
  strategies?: unknown;
  pagination?: unknown;
};

type RawSwotsData = {
  swots?: unknown;
  pagination?: unknown;
};

type RawContentsData = {
  campaigns?: unknown;
  pagination?: unknown;
};

type RawScheduledPostsData = {
  posts?: unknown;
  total?: unknown;
  pagination?: unknown;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  return typeof value === "boolean" ? value : fallback;
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

const asStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const toIso = (value: unknown, fallback?: string): string => {
  if (!value) {
    return fallback || new Date().toISOString();
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return fallback || new Date().toISOString();
  }

  return date.toISOString();
};

const normalizeAdminUser = (payload: unknown): AdminUser => {
  const source = asRecord(payload);

  const rawId = source.id ?? source._id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

  const createdAt = toIso(source.createdAt);
  const updatedAt = toIso(source.updatedAt, createdAt);

  return {
    id,
    fullName: asString(source.fullName),
    email: asString(source.email),
    role: source.role === "admin" ? "admin" : "user",
    isBanned: asBoolean(source.isBanned, false),
    bannedAt: source.bannedAt ? toIso(source.bannedAt) : undefined,
    banReason: asString(source.banReason) || undefined,
    phone: asString(source.phone) || undefined,
    companyName: asString(source.companyName) || undefined,
    industry: asString(source.industry) || undefined,
    lastLoginAt: source.lastLoginAt ? toIso(source.lastLoginAt) : undefined,
    createdAt,
    updatedAt,
  };
};

const normalizeAdminStrategy = (payload: unknown): AdminStrategy => {
  const source = asRecord(payload);
  const rawId = source.id ?? source._id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

  const userSource = asRecord(source.userId);
  const rawUserId = userSource._id ?? userSource.id ?? source.userId;
  const userId =
    typeof rawUserId === "string"
      ? rawUserId
      : asString(rawUserId?.toString?.(), "");

  const businessSource = asRecord(source.businessInfo);
  const createdAt = toIso(source.createdAt);
  const updatedAt = toIso(source.updatedAt, createdAt);

  return {
    id,
    userId,
    user: {
      id: userId,
      fullName: asString(userSource.fullName, "Utilisateur inconnu"),
      email: asString(userSource.email, "-"),
      companyName: asString(userSource.companyName) || undefined,
      role: userSource.role === "admin" ? "admin" : "user",
    },
    businessInfo: {
      businessName: asString(businessSource.businessName, "Sans nom"),
      industry: asString(businessSource.industry, "-"),
      productOrService: asString(businessSource.productOrService, "-"),
      targetAudience: asString(businessSource.targetAudience, "-"),
      location: asString(businessSource.location, "-"),
      mainObjective: asString(businessSource.mainObjective, "-"),
      tone: asString(businessSource.tone, "-"),
      budget:
        typeof businessSource.budget === "number"
          ? businessSource.budget
          : undefined,
    },
    createdAt,
    updatedAt,
  };
};

const normalizeGeneratedStrategy = (
  value: unknown,
): AdminStrategyDetail["generatedStrategy"] => {
  const source = asRecord(value);
  return {
    avant: asRecord(
      source.avant,
    ) as unknown as AdminStrategyDetail["generatedStrategy"]["avant"],
    pendant: asRecord(
      source.pendant,
    ) as unknown as AdminStrategyDetail["generatedStrategy"]["pendant"],
    apres: asRecord(
      source.apres,
    ) as unknown as AdminStrategyDetail["generatedStrategy"]["apres"],
  };
};

const normalizeAdminStrategyDetail = (
  payload: unknown,
): AdminStrategyDetail => {
  const base = normalizeAdminStrategy(payload);
  const source = asRecord(payload);

  return {
    ...base,
    generatedStrategy: normalizeGeneratedStrategy(source.generatedStrategy),
  };
};

const normalizeSwotMatrix = (value: unknown): AdminSwotMatrix => {
  const source = asRecord(value);
  const toList = (raw: unknown): string[] =>
    Array.isArray(raw)
      ? raw.filter((item): item is string => typeof item === "string")
      : [];

  return {
    strengths: toList(source.strengths),
    weaknesses: toList(source.weaknesses),
    opportunities: toList(source.opportunities),
    threats: toList(source.threats),
  };
};

const normalizeAdminSwot = (payload: unknown): AdminSwot => {
  const source = asRecord(payload);
  const rawId = source.id ?? source._id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

  const userSource = asRecord(source.userId);
  const rawUserId = userSource._id ?? userSource.id ?? source.userId;
  const userId =
    typeof rawUserId === "string"
      ? rawUserId
      : asString(rawUserId?.toString?.(), "");

  const strategySource = asRecord(source.strategyId);
  const rawStrategyId =
    strategySource._id ?? strategySource.id ?? source.strategyId;
  const strategyId =
    typeof rawStrategyId === "string"
      ? rawStrategyId
      : asString(rawStrategyId?.toString?.(), "");

  const strategyBusinessInfo = asRecord(strategySource.businessInfo);
  const createdAt = toIso(source.createdAt);
  const updatedAt = toIso(source.updatedAt, createdAt);

  return {
    id,
    userId,
    strategyId,
    title: asString(source.title, "SWOT"),
    user: {
      id: userId,
      fullName: asString(userSource.fullName, "Utilisateur inconnu"),
      email: asString(userSource.email, "-"),
      companyName: asString(userSource.companyName) || undefined,
      role: userSource.role === "admin" ? "admin" : "user",
    },
    strategy: {
      id: strategyId,
      businessName: asString(
        strategyBusinessInfo.businessName,
        "Strategie inconnue",
      ),
      industry: asString(strategyBusinessInfo.industry, "-"),
    },
    swot: normalizeSwotMatrix(source.swot),
    isAiGenerated: asBoolean(source.isAiGenerated, false),
    createdAt,
    updatedAt,
  };
};

const normalizeAdminSwotDetail = (payload: unknown): AdminSwotDetail => {
  const base = normalizeAdminSwot(payload);
  const source = asRecord(payload);
  const inputsSource = asRecord(source.inputs);
  const toList = (raw: unknown): string[] =>
    Array.isArray(raw)
      ? raw.filter((item): item is string => typeof item === "string")
      : [];

  return {
    ...base,
    inputs: {
      notesInternes: asString(inputsSource.notesInternes) || undefined,
      notesExternes: asString(inputsSource.notesExternes) || undefined,
      concurrents: toList(inputsSource.concurrents),
      ressources: toList(inputsSource.ressources),
      objectifs: asString(inputsSource.objectifs) || undefined,
    },
  };
};

const normalizeContentInputs = (
  value: unknown,
): AdminContentDetail["inputs"] => {
  const source = asRecord(value);

  return {
    productOffer: asString(source.productOffer) || undefined,
    targetAudience: asString(source.targetAudience) || undefined,
    tone: asString(source.tone) || undefined,
    callToAction: asString(source.callToAction) || undefined,
    promoDetails: asString(source.promoDetails) || undefined,
    budget: typeof source.budget === "number" ? source.budget : undefined,
    contentPillars: asStringArray(source.contentPillars),
    frequencyPerWeek:
      typeof source.frequencyPerWeek === "number"
        ? source.frequencyPerWeek
        : undefined,
    startDate: source.startDate ? toIso(source.startDate) : undefined,
    endDate: source.endDate ? toIso(source.endDate) : undefined,
    platforms: asStringArray(source.platforms),
  };
};

const normalizeCampaignSummary = (
  value: unknown,
): AdminContentDetail["campaignSummary"] => {
  const source = asRecord(value);
  const postingPlan = asRecord(source.postingPlan);

  return {
    contentPillars: asStringArray(source.contentPillars),
    postingPlan: {
      frequencyPerWeek:
        typeof postingPlan.frequencyPerWeek === "number"
          ? postingPlan.frequencyPerWeek
          : undefined,
      durationWeeks:
        typeof postingPlan.durationWeeks === "number"
          ? postingPlan.durationWeeks
          : undefined,
    },
  };
};

const normalizeGeneratedPost = (
  value: unknown,
): AdminContentDetail["generatedPosts"][number] => {
  const source = asRecord(value);
  const rawId = source._id ?? source.id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");
  const schedule = asRecord(source.schedule);

  return {
    ...(id ? { _id: id } : {}),
    platform: asString(source.platform),
    type: asString(source.type),
    title: asString(source.title) || undefined,
    caption: asString(source.caption),
    description: asString(source.description) || undefined,
    hashtags: asStringArray(source.hashtags),
    hook: asString(source.hook) || undefined,
    cta: asString(source.cta) || undefined,
    adCopyVariantA: asString(source.adCopyVariantA) || undefined,
    adCopyVariantB: asString(source.adCopyVariantB) || undefined,
    adCopyVariantC: asString(source.adCopyVariantC) || undefined,
    suggestedVisual: asString(source.suggestedVisual) || undefined,
    schedule:
      asString(schedule.date) || asString(schedule.time) || asString(schedule.timezone)
        ? {
            date: asString(schedule.date),
            time: asString(schedule.time),
            timezone: asString(schedule.timezone, "UTC"),
          }
        : undefined,
  };
};

const normalizeScheduledPost = (value: unknown): ScheduledPost => {
  const source = asRecord(value);
  const rawId = source._id ?? source.id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

  return {
    _id: id,
    userId: asString(source.userId),
    strategyId: asString(source.strategyId) || null,
    campaignId: asString(source.campaignId) || null,
    platform: asString(source.platform) as ScheduledPost["platform"],
    postType: asString(source.postType) as ScheduledPost["postType"],
    title: asString(source.title) || null,
    caption: asString(source.caption),
    hashtags: asStringArray(source.hashtags),
    mediaUrls: asStringArray(source.mediaUrls),
    scheduledAt: toIso(source.scheduledAt),
    status: asString(source.status, "planned") as ScheduledPost["status"],
    timezone: asString(source.timezone, "UTC"),
    notes: asString(source.notes) || null,
    createdAt: toIso(source.createdAt),
    updatedAt: toIso(source.updatedAt),
  };
};

const normalizeAdminContent = (payload: unknown): AdminContent => {
  const source = asRecord(payload);
  const rawId = source.id ?? source._id;
  const id =
    typeof rawId === "string" ? rawId : asString(rawId?.toString?.(), "");

  const userSource = asRecord(source.userId);
  const rawUserId = userSource._id ?? userSource.id ?? source.userId;
  const userId =
    typeof rawUserId === "string"
      ? rawUserId
      : asString(rawUserId?.toString?.(), "");

  const strategySource = asRecord(source.strategyId);
  const rawStrategyId =
    strategySource._id ?? strategySource.id ?? source.strategyId;
  const strategyId =
    typeof rawStrategyId === "string"
      ? rawStrategyId
      : asString(rawStrategyId?.toString?.(), "");

  const businessInfo = asRecord(strategySource.businessInfo);
  const createdAt = toIso(source.createdAt);
  const updatedAt = toIso(source.updatedAt, createdAt);
  const generatedPosts = Array.isArray(source.generatedPosts)
    ? source.generatedPosts
    : [];

  return {
    id,
    userId,
    strategyId,
    name: asString(source.name, "Campagne sans nom"),
    mode: source.mode === "ADS" ? "ADS" : "CONTENT_MARKETING",
    objective:
      source.objective === "leads" ||
      source.objective === "sales" ||
      source.objective === "engagement"
        ? source.objective
        : "awareness",
    platforms: asStringArray(source.platforms),
    generatedPostsCount: generatedPosts.length,
    user: {
      id: userId,
      fullName: asString(userSource.fullName, "Utilisateur inconnu"),
      email: asString(userSource.email, "-"),
      companyName: asString(userSource.companyName) || undefined,
      role: userSource.role === "admin" ? "admin" : "user",
    },
    strategy: {
      id: strategyId,
      businessName: asString(businessInfo.businessName, "Strategie inconnue"),
      industry: asString(businessInfo.industry, "-"),
    },
    createdAt,
    updatedAt,
  };
};

const normalizeAdminContentDetail = (payload: unknown): AdminContentDetail => {
  const base = normalizeAdminContent(payload);
  const source = asRecord(payload);
  const generatedPosts = Array.isArray(source.generatedPosts)
    ? source.generatedPosts
    : [];

  return {
    ...base,
    inputs: normalizeContentInputs(source.inputs),
    campaignSummary: normalizeCampaignSummary(source.campaignSummary),
    generatedPosts: generatedPosts.map((item) => normalizeGeneratedPost(item)),
  };
};

const buildUsersQuery = (filters: AdminUsersFilters): string => {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.role && filters.role !== "all") {
    params.set("role", filters.role);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildStrategiesQuery = (filters: AdminStrategiesFilters): string => {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildSwotsQuery = (filters: AdminSwotFilters): string => {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildContentsQuery = (filters: AdminContentsFilters): string => {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildUserCalendarQuery = (filters: AdminUserCalendarFilters): string => {
  const params = new URLSearchParams({
    rangeStart: filters.rangeStart,
    rangeEnd: filters.rangeEnd,
  });

  if (filters.platform) {
    params.set("platform", filters.platform);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  return `?${params.toString()}`;
};

export class AdminService {
  static async getUsers(
    filters: AdminUsersFilters = {},
  ): Promise<AdminUsersResult> {
    const query = buildUsersQuery(filters);
    const response = (await api.get(
      `/users/admin/all${query}`,
      true,
    )) as ApiEnvelope<RawUsersData>;

    if (!response?.success) {
      throw new Error(
        response?.message || "Impossible de recuperer les utilisateurs",
      );
    }

    const data = response.data;
    const usersValue = data?.users;

    if (!Array.isArray(usersValue)) {
      throw new Error("Reponse utilisateurs invalide");
    }

    return {
      users: usersValue.map((item) => normalizeAdminUser(item)),
      total: asNumber(data?.total, 0),
      page: asNumber(data?.page, 1),
      limit: asNumber(data?.limit, 10),
      totalPages: asNumber(data?.totalPages, 1),
    };
  }

  static async getStats(): Promise<AdminUserStats> {
    const response = (await api.get("/users/admin/stats", true)) as ApiEnvelope<
      Record<string, unknown>
    >;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer les statistiques",
      );
    }

    return {
      total: asNumber(response.data.total, 0),
      admins: asNumber(response.data.admins, 0),
      banned: asNumber(response.data.banned, 0),
      recentSignups: asNumber(response.data.recentSignups, 0),
    };
  }

  static async getStrategies(
    filters: AdminStrategiesFilters = {},
  ): Promise<AdminStrategiesResult> {
    const query = buildStrategiesQuery(filters);
    const response = (await api.get(
      `/strategies/admin/all${query}`,
      true,
    )) as ApiEnvelope<RawStrategiesData>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer les strategies",
      );
    }

    const strategiesValue = response.data.strategies;
    if (!Array.isArray(strategiesValue)) {
      throw new Error("Reponse strategies invalide");
    }

    const paginationSource = asRecord(response.data.pagination);

    return {
      strategies: strategiesValue.map((item) => normalizeAdminStrategy(item)),
      total: asNumber(paginationSource.total, 0),
      page: asNumber(paginationSource.page, 1),
      limit: asNumber(paginationSource.limit, 10),
      totalPages: asNumber(paginationSource.pages, 1),
    };
  }

  static async getStrategyById(
    strategyId: string,
  ): Promise<AdminStrategyDetail> {
    const response = (await api.get(
      `/strategies/admin/${strategyId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer la strategie",
      );
    }

    return normalizeAdminStrategyDetail(response.data);
  }

  static async getSwots(
    filters: AdminSwotFilters = {},
  ): Promise<AdminSwotsResult> {
    const query = buildSwotsQuery(filters);
    const response = (await api.get(
      `/swot/admin/all${query}`,
      true,
    )) as ApiEnvelope<RawSwotsData>;

    if (!response?.success || !response?.data) {
      throw new Error(response?.message || "Impossible de recuperer les SWOT");
    }

    const swotsValue = response.data.swots;
    if (!Array.isArray(swotsValue)) {
      throw new Error("Reponse SWOT invalide");
    }

    const paginationSource = asRecord(response.data.pagination);

    return {
      swots: swotsValue.map((item) => normalizeAdminSwot(item)),
      total: asNumber(paginationSource.total, 0),
      page: asNumber(paginationSource.page, 1),
      limit: asNumber(paginationSource.limit, 10),
      totalPages: asNumber(paginationSource.pages, 1),
    };
  }

  static async getSwotById(swotId: string): Promise<AdminSwotDetail> {
    const response = (await api.get(
      `/swot/admin/${swotId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(response?.message || "Impossible de recuperer le SWOT");
    }

    return normalizeAdminSwotDetail(response.data);
  }

  static async getContents(
    filters: AdminContentsFilters = {},
  ): Promise<AdminContentsResult> {
    const query = buildContentsQuery(filters);
    const response = (await api.get(
      `/content/admin/all${query}`,
      true,
    )) as ApiEnvelope<RawContentsData>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer les contenus",
      );
    }

    const campaignsValue = response.data.campaigns;
    if (!Array.isArray(campaignsValue)) {
      throw new Error("Reponse contenus invalide");
    }

    const paginationSource = asRecord(response.data.pagination);

    return {
      campaigns: campaignsValue.map((item) => normalizeAdminContent(item)),
      total: asNumber(paginationSource.total, 0),
      page: asNumber(paginationSource.page, 1),
      limit: asNumber(paginationSource.limit, 10),
      totalPages: asNumber(paginationSource.pages, 1),
    };
  }

  static async getContentById(contentId: string): Promise<AdminContentDetail> {
    const response = (await api.get(
      `/content/admin/${contentId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer ce contenu",
      );
    }

    return normalizeAdminContentDetail(response.data);
  }

  static async updateUserRole(
    userId: string,
    role: AdminUserRole,
  ): Promise<AdminUser> {
    const response = (await api.put(
      `/users/admin/${userId}/role`,
      { role },
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de modifier le role utilisateur",
      );
    }

    return normalizeAdminUser(response.data);
  }

  static async getUserById(userId: string): Promise<AdminUser> {
    const response = (await api.get(
      `/users/admin/${userId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer cet utilisateur",
      );
    }

    return normalizeAdminUser(response.data);
  }

  static async getUserCalendar(
    userId: string,
    filters: AdminUserCalendarFilters,
  ): Promise<AdminUserCalendarResult> {
    const query = buildUserCalendarQuery(filters);
    const response = (await api.get(
      `/calendar/posts/admin/users/${userId}${query}`,
      true,
    )) as ApiEnvelope<RawScheduledPostsData>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de recuperer le calendrier utilisateur",
      );
    }

    const postsValue = response.data.posts;
    if (!Array.isArray(postsValue)) {
      throw new Error("Reponse calendrier admin invalide");
    }

    const paginationSource = asRecord(response.data.pagination);

    return {
      posts: postsValue.map((item) => normalizeScheduledPost(item)),
      total: asNumber(response.data.total, 0),
      page: asNumber(paginationSource.page, filters.page ?? 1),
      limit: asNumber(paginationSource.limit, filters.limit ?? 50),
      totalPages: asNumber(paginationSource.pages, 1),
    };
  }

  static async createUser(payload: AdminCreateUserPayload): Promise<AdminUser> {
    const response = (await api.post(
      "/users/admin",
      payload,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de creer cet utilisateur",
      );
    }

    return normalizeAdminUser(response.data);
  }

  static async updateUser(
    userId: string,
    payload: AdminUpdateUserPayload,
  ): Promise<AdminUser> {
    const response = (await api.put(
      `/users/admin/${userId}`,
      payload,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de mettre a jour cet utilisateur",
      );
    }

    return normalizeAdminUser(response.data);
  }

  static async deleteUser(userId: string): Promise<void> {
    const response = (await api.delete(
      `/users/admin/${userId}`,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success) {
      throw new Error(
        response?.message || "Impossible de supprimer cet utilisateur",
      );
    }
  }

  static async setUserBanStatus(
    userId: string,
    payload: SetUserBanPayload,
  ): Promise<AdminUser> {
    const response = (await api.put(
      `/users/admin/${userId}/ban`,
      payload,
      true,
    )) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(
        response?.message || "Impossible de modifier le statut de bannissement",
      );
    }

    return normalizeAdminUser(response.data);
  }
}

export default AdminService;
