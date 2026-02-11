// utils/fetcher.ts - Fonction fetch avec gestion JWT automatique

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

// Fonction utilitaire pour gérer les tokens
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'accessToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    console.log('Getting access token:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    console.log('Getting refresh token:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') {
      console.log('Cannot save tokens: window is undefined (SSR)');
      return;
    }
    
    try {
      console.log('Attempting to save tokens to localStorage...');
      console.log('AccessToken length:', accessToken?.length || 0);
      console.log('RefreshToken length:', refreshToken?.length || 0);
      
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      
      // Vérifier que c'est bien sauvé
      const savedAccess = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const savedRefresh = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (savedAccess && savedRefresh) {
        console.log('✅ Tokens successfully saved to localStorage');
        console.log('Saved AccessToken preview:', savedAccess.substring(0, 20) + '...');
        console.log('Saved RefreshToken preview:', savedRefresh.substring(0, 20) + '...');
      } else {
        console.error('❌ Failed to save tokens to localStorage');
      }
    } catch (error) {
      console.error('❌ Error saving tokens to localStorage:', error);
    }
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    console.log('🧹 Clearing tokens from localStorage...');
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    console.log('✅ Tokens cleared');
  }

  // Fonction de diagnostic
  static diagnose(): void {
    if (typeof window === 'undefined') {
      console.log('🔍 Token Diagnostic: Running on server-side (SSR)');
      return;
    }

    console.log('🔍 === TOKEN DIAGNOSTIC ===');
    console.log('localStorage available:', typeof Storage !== 'undefined');
    console.log('window available:', typeof window !== 'undefined');
    
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    console.log('Access Token stored:', !!accessToken, accessToken ? `(${accessToken.length} chars)` : '');
    console.log('Refresh Token stored:', !!refreshToken, refreshToken ? `(${refreshToken.length} chars)` : '');
    
    // Vérifier tous les items du localStorage
    console.log('All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || '');
      console.log(`  ${key}: ${value ? `${value.substring(0, 30)}...` : 'null'}`);
    }
    console.log('🔍 === END DIAGNOSTIC ===');
  }
}

// Configuration de base
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Fonction principale de fetch avec gestion JWT
export async function fetcher<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = false, headers = {}, ...restOptions } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  // Préparation des headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Ajouter le token d'authentification si nécessaire
  if (requireAuth) {
    const accessToken = TokenManager.getAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      ...restOptions,
    });

    // Gestion de l'expiration du token (401)
    if (response.status === 401 && requireAuth) {
      const refreshSuccess = await refreshAccessToken();
      
      if (refreshSuccess) {
        // Retry avec le nouveau token
        const newAccessToken = TokenManager.getAccessToken();
        if (newAccessToken) {
          const retryHeaders: Record<string, string> = {
            ...requestHeaders,
            Authorization: `Bearer ${newAccessToken}`,
          };
          
          const retryResponse = await fetch(url, {
            headers: retryHeaders,
            ...restOptions,
          });
          return await retryResponse.json();
        }
      }
      
      // Échec du refresh, rediriger vers login
      TokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    // Parse de la réponse
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error('Fetch error:', error);
    throw error instanceof Error ? error : new Error('Erreur réseau');
  }
}

// Fonction pour rafraîchir le token d'accès
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    
    if (data.success && data.accessToken && data.refreshToken) {
      TokenManager.setTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

// Fonctions utilitaires spécialisées
export const api = {
  get: <T>(endpoint: string, requireAuth = false) =>
    fetcher<T>(endpoint, { method: 'GET', requireAuth }),

  post: <T>(endpoint: string, data?: any, requireAuth = false) =>
    fetcher<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth,
    }),

  put: <T>(endpoint: string, data?: any, requireAuth = false) =>
    fetcher<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth,
    }),

  delete: <T>(endpoint: string, requireAuth = false) =>
    fetcher<T>(endpoint, { method: 'DELETE', requireAuth }),
};

// Export des utilitaires token pour usage direct
export { TokenManager };

// Pour debugging global - accessible depuis la console
if (typeof window !== 'undefined') {
  (window as any).TokenManager = TokenManager;
  (window as any).diagnoseTokens = () => TokenManager.diagnose();
}