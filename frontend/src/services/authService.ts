// services/authService.ts - Service d'authentification avec appels API

import { api, TokenManager } from '../utils/fetcher';

// Types pour l'authentification
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
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

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  industry: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Service d'authentification
export class AuthService {
  // 🔐 AUTHENTIFICATION
  static async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      // Sauvegarder les tokens
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      return response.data;
    }
    
    throw new Error(response.message || 'Erreur lors de l\'inscription');
  }

  static async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    
    if (response.success && response.data) {
      // Sauvegarder les tokens
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      return response.data;
    }
    
    throw new Error(response.message || 'Erreur lors de la connexion');
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {}, true);
    } catch (error) {
      // Continue même si l'appel API échoue
      console.warn('Logout API call failed:', error);
    } finally {
      // Supprimer les tokens localement
      TokenManager.clearTokens();
    }
  }

  static async refreshToken(): Promise<AuthTokens | null> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return null;

      const response = await api.post<AuthTokens>('/auth/refresh-token', {
        refreshToken,
      });

      if (response.success && response.data) {
        TokenManager.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
        return response.data;
      }

      return null;
    } catch (error) {
      TokenManager.clearTokens();
      return null;
    }
  }

  // 👤 GESTION UTILISATEUR
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me', true);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Erreur lors de la récupération du profil');
  }

  static async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile', true);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Erreur lors de la récupération du profil');
  }

  static async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put<User>('/users/profile', data, true);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
  }

  static async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await api.put('/users/password', data, true);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors du changement de mot de passe');
    }
  }

  // 🔍 VÉRIFICATIONS
  static isAuthenticated(): boolean {
    return !!TokenManager.getAccessToken();
  }

  static async checkAuth(): Promise<boolean> {
    const accessToken = TokenManager.getAccessToken();
    if (!accessToken) return false;

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      // Essayer de rafraîchir le token
      const newTokens = await this.refreshToken();
      if (newTokens) {
        try {
          await this.getCurrentUser();
          return true;
        } catch (error) {
          TokenManager.clearTokens();
          return false;
        }
      }
      
      TokenManager.clearTokens();
      return false;
    }
  }

  // 🔒 ADMINISTRATION (pour plus tard)
  static async getUserPermissions(): Promise<{
    user: { id: string; email: string; role: string };
    permissions: Record<string, boolean>;
  }> {
    const response = await api.get('/auth/permissions', true);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Erreur lors de la récupération des permissions');
  }
}

// Export par défaut du service
export default AuthService;