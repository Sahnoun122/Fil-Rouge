// services/authService.ts - Service d'authentification avec appels API

import { api, TokenManager } from '../utils/fetcher';
import { TokenValidator } from '../utils/tokenValidator';

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
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Type pour les réponses API génériques
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
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
    console.log('🔑 Starting register process...');
    
    const response = await api.post('/auth/register', data) as any;
    
    console.log('🔑 Register API response received:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      // Les données sont directement dans response, pas dans response.data
      const user = response.user || response.data?.user;
      const tokens = response.tokens || response.data?.tokens;
      
      console.log('🔑 Register response structure:', {
        hasUser: !!user,
        hasTokens: !!tokens,
        userKeys: user ? Object.keys(user) : [],
        tokenKeys: tokens ? Object.keys(tokens) : [],
        fullResponse: Object.keys(response)
      });
      
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        // Sauvegarder les tokens
        TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
        console.log('✅ Tokens saved successfully after registration');
        
        // Diagnostic pour vérifier
        TokenManager.diagnose();
        
        return { user, tokens };
      } else {
        console.error('❌ Invalid tokens structure in registration:', tokens);
        console.error('❌ Full response for debugging:', response);
        throw new Error('Tokens invalides reçus lors de l\'inscription');
      }
    }
    
    console.error('❌ Registration failed:', response);
    throw new Error(response.message || 'Erreur lors de l\'inscription');
  }

  static async login(data: LoginData): Promise<LoginResponse> {
    console.log('🔑 Starting login process...');
    
    const response = await api.post('/auth/login', data) as any;
    
    console.log('🔑 Login API response received:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      // Les données sont directement dans response, pas dans response.data
      const user = response.user || response.data?.user;
      const tokens = response.tokens || response.data?.tokens;
      
      console.log('🔑 Response data structure:', {
        hasUser: !!user,
        hasTokens: !!tokens,
        userKeys: user ? Object.keys(user) : [],
        tokenKeys: tokens ? Object.keys(tokens) : [],
        fullResponse: Object.keys(response)
      });
      
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        console.log('🔑 Valid tokens found, saving...');
        console.log('🔑 AccessToken length:', tokens.accessToken.length);
        console.log('🔑 RefreshToken length:', tokens.refreshToken.length);
        
        // Sauvegarder les tokens
        TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
        console.log('✅ Tokens saved successfully after login');
        
        // Diagnostic pour vérifier
        TokenManager.diagnose();
        
        return { user, tokens };
      } else {
        console.error('❌ Invalid tokens structure:', tokens);
        console.error('❌ Full response for debugging:', response);
        throw new Error('Tokens invalides reçus du serveur');
      }
    }
    
    console.error('❌ Login failed:', response);
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
      if (!refreshToken) {
        console.warn('No refresh token available');
        TokenManager.clearTokens();
        return null;
      }

      console.log('🔄 Starting token refresh...');
      const response = await api.post('/auth/refresh-token', {
        refreshToken,
      }) as any; // Assertion de type temporaire pour éviter les erreurs TypeScript

      console.log('🔄 Refresh token API response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Vérifier la structure de la réponse refresh token
        const accessToken = response.accessToken || response.data?.accessToken;
        const newRefreshToken = response.refreshToken || response.data?.refreshToken;
        
        console.log('🔄 Refresh response structure:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!newRefreshToken,
          fullResponseKeys: Object.keys(response)
        });
        
        if (accessToken && newRefreshToken) {
          TokenManager.setTokens(accessToken, newRefreshToken);
          console.log('✅ Tokens refreshed and saved successfully');
          return { accessToken, refreshToken: newRefreshToken };
        } else {
          console.warn('❌ Invalid refresh response structure:', response);
          TokenManager.clearTokens();
        }
      } else {
        console.warn('❌ Failed refresh response:', response);
        TokenManager.clearTokens();
      }

      return null;
    } catch (error: any) {
      console.warn('🔄 Refresh token failed (silently handled):', error.message);
      // Nettoyer les tokens invalides en silence
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
    // Validation préalable des tokens stockés
    const validation = TokenValidator.validateStoredTokens();
    if (!validation.valid) {
      console.log('Tokens stockés invalides:', validation.reason);
      TokenManager.clearTokens();
      return false;
    }

    const accessToken = TokenManager.getAccessToken();
    if (!accessToken) {
      TokenManager.clearTokens();
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      // Essayer de rafraîchir le token silencieusement
      try {
        const newTokens = await this.refreshToken();
        if (newTokens) {
          // Vérifier que le nouveau token fonctionne
          await this.getCurrentUser();
          return true;
        }
      } catch (refreshError) {
        console.warn('Refresh failed during checkAuth:', refreshError);
      }
      
      // Nettoyer les tokens et retourner false silencieusement
      TokenManager.clearTokens();
      return false;
    }
  }

  // 🔒 ADMINISTRATION (pour plus tard)
  static async getUserPermissions(): Promise<{
    user: { id: string; email: string; role: string };
    permissions: Record<string, boolean>;
  }> {
    const response = await api.get<{
      user: { id: string; email: string; role: string };
      permissions: Record<string, boolean>;
    }>('/auth/permissions', true);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Valeurs par défaut si les données ne sont pas disponibles
    return {
      user: { id: '', email: '', role: 'user' },
      permissions: {},
    };
  }
}

// Export par défaut du service
export default AuthService;