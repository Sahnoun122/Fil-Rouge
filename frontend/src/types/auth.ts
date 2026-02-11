// types/auth.ts - Types pour l'authentification

export interface User {
  id: string;  // Changé de _id à id pour correspondre au backend
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  emailVerified?: boolean;
  phone?: string;
  companyName?: string;
  industry?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}