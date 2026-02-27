export type AdminUserRole = 'admin' | 'user';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  isBanned: boolean;
  bannedAt?: string;
  banReason?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminUserRole | 'all';
}

export interface AdminUsersResult {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserStats {
  total: number;
  admins: number;
  banned: number;
  recentSignups: number;
}

export interface AdminCreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  role?: AdminUserRole;
}

export interface AdminUpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  role?: AdminUserRole;
}

export interface SetUserBanPayload {
  ban: boolean;
  reason?: string;
}
