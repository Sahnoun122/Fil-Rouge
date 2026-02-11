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
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// Configuration de base
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Fonction principale de fetch avec gestion JWT
export async function fetcher<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = false, headers, ...restOptions } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  // Préparation des headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
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
          requestHeaders.Authorization = `Bearer ${newAccessToken}`;
          const retryResponse = await fetch(url, {
            headers: requestHeaders,
            ...restOptions,
          });
          return await retryResponse.json();
        }
      }
      
      // Échec du refresh, rediriger vers login
      TokenManager.clearTokens();
      window.location.href = '/login';
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