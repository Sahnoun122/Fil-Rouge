export type UserRole = "admin" | "user";

export interface UserPreferences {
  emailNotifications: boolean;
  contentReminders: boolean;
  weeklyDigest: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isBanned: boolean;

  phone?: string;
  companyName?: string;
  industry?: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;

  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  industry: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: AuthTokens;
}
