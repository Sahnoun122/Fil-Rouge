export type AdminUserRole = 'admin' | 'user';
export type AdminUserStatusFilter = 'all' | 'active' | 'inactive';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  emailVerified: boolean;
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
  status?: AdminUserStatusFilter;
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
  active: number;
  inactive: number;
  admins: number;
  emailVerified: number;
  recentSignups: number;
}
