export type UserRole = "admin" | "user";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;

  phone?: string;
  companyName?: string;
  industry?: string;
  lastLoginAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
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
