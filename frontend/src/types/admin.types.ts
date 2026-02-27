import type { GeneratedStrategy } from './strategy.types';

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

export interface AdminStrategiesFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminStrategyUser {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  role: AdminUserRole;
}

export interface AdminStrategyBusinessInfo {
  businessName: string;
  industry: string;
  productOrService: string;
  targetAudience: string;
  location: string;
  mainObjective: string;
  tone: string;
  budget?: number;
}

export interface AdminStrategy {
  id: string;
  userId: string;
  user: AdminStrategyUser;
  businessInfo: AdminStrategyBusinessInfo;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStrategiesResult {
  strategies: AdminStrategy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStrategyDetail extends AdminStrategy {
  generatedStrategy: GeneratedStrategy;
}

export interface AdminSwotFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminSwotStrategySummary {
  id: string;
  businessName: string;
  industry: string;
}

export interface AdminSwotInputs {
  notesInternes?: string;
  notesExternes?: string;
  concurrents?: string[];
  ressources?: string[];
  objectifs?: string;
}

export interface AdminSwotMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface AdminSwot {
  id: string;
  userId: string;
  strategyId: string;
  title: string;
  user: AdminStrategyUser;
  strategy: AdminSwotStrategySummary;
  swot: AdminSwotMatrix;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSwotDetail extends AdminSwot {
  inputs: AdminSwotInputs;
}

export interface AdminSwotsResult {
  swots: AdminSwot[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
