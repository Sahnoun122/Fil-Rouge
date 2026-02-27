import { api } from '../utils/fetcher';
import {
  AdminUser,
  AdminUserRole,
  AdminUserStats,
  AdminUsersFilters,
  AdminUsersResult,
} from '../types/admin.types';

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

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
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
  const id = typeof rawId === 'string' ? rawId : asString(rawId?.toString?.(), '');

  const createdAt = toIso(source.createdAt);
  const updatedAt = toIso(source.updatedAt, createdAt);

  return {
    id,
    fullName: asString(source.fullName),
    email: asString(source.email),
    role: source.role === 'admin' ? 'admin' : 'user',
    isActive: asBoolean(source.isActive, true),
    emailVerified: asBoolean(source.emailVerified, false),
    phone: asString(source.phone) || undefined,
    companyName: asString(source.companyName) || undefined,
    industry: asString(source.industry) || undefined,
    lastLoginAt: source.lastLoginAt ? toIso(source.lastLoginAt) : undefined,
    createdAt,
    updatedAt,
  };
};

const buildUsersQuery = (filters: AdminUsersFilters): string => {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set('page', String(filters.page));
  }

  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.role && filters.role !== 'all') {
    params.set('role', filters.role);
  }

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

export class AdminService {
  static async getUsers(filters: AdminUsersFilters = {}): Promise<AdminUsersResult> {
    const query = buildUsersQuery(filters);
    const response = (await api.get(`/users/admin/all${query}`, true)) as ApiEnvelope<RawUsersData>;

    if (!response?.success) {
      throw new Error(response?.message || 'Impossible de recuperer les utilisateurs');
    }

    const data = response.data;
    const usersValue = data?.users;

    if (!Array.isArray(usersValue)) {
      throw new Error('Reponse utilisateurs invalide');
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
    const response = (await api.get('/users/admin/stats', true)) as ApiEnvelope<Record<string, unknown>>;

    if (!response?.success || !response?.data) {
      throw new Error(response?.message || 'Impossible de recuperer les statistiques');
    }

    return {
      total: asNumber(response.data.total, 0),
      active: asNumber(response.data.active, 0),
      inactive: asNumber(response.data.inactive, 0),
      admins: asNumber(response.data.admins, 0),
      emailVerified: asNumber(response.data.emailVerified, 0),
      recentSignups: asNumber(response.data.recentSignups, 0),
    };
  }

  static async toggleUserStatus(userId: string): Promise<AdminUser> {
    const response = (await api.put(`/users/admin/${userId}/toggle-status`, {}, true)) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(response?.message || 'Impossible de modifier le statut utilisateur');
    }

    return normalizeAdminUser(response.data);
  }

  static async updateUserRole(userId: string, role: AdminUserRole): Promise<AdminUser> {
    const response = (await api.put(`/users/admin/${userId}/role`, { role }, true)) as ApiEnvelope<unknown>;

    if (!response?.success || !response?.data) {
      throw new Error(response?.message || 'Impossible de modifier le role utilisateur');
    }

    return normalizeAdminUser(response.data);
  }
}

export default AdminService;
