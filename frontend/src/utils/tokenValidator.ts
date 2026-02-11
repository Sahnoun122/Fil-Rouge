// utils/tokenValidator.ts - Validation et nettoyage des tokens

import { TokenManager } from './tokenManager';

export class TokenValidator {
  /**
   * Vérifie si un token semble valide (structure basique)
   */
  static isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      // Vérification basique de la structure JWT
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Vérifier que toutes les parties sont base64 valides
      for (const part of parts) {
        if (!part || part.length === 0) return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Vérifie si un token JWT est expiré
   */
  static isTokenExpired(token: string): boolean {
    try {
      if (!this.isTokenValid(token)) return true;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      return true; // En cas d'erreur, considérer comme expiré
    }
  }

  /**
   * Nettoie les tokens invalides ou expirés
   */
  static cleanupInvalidTokens(): void {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    
    let needsCleanup = false;
    
    // Vérifier l'access token
    if (accessToken && (!this.isTokenValid(accessToken) || this.isTokenExpired(accessToken))) {
      console.warn('Access token invalide ou expiré détecté');
      needsCleanup = true;
    }
    
    // Vérifier le refresh token
    if (refreshToken && (!this.isTokenValid(refreshToken) || this.isTokenExpired(refreshToken))) {
      console.warn('Refresh token invalide ou expiré détecté');
      needsCleanup = true;
    }
    
    if (needsCleanup) {
      console.log('Nettoyage des tokens invalides...');
      TokenManager.clearTokens();
    }
  }

  /**
   * Validation complète des tokens stockés
   */
  static validateStoredTokens(): { valid: boolean; reason?: string } {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!accessToken) {
      return { valid: false, reason: 'Aucun access token' };
    }
    
    if (!this.isTokenValid(accessToken)) {
      return { valid: false, reason: 'Access token invalide' };
    }
    
    if (!refreshToken) {
      return { valid: false, reason: 'Aucun refresh token' };
    }
    
    if (!this.isTokenValid(refreshToken)) {
      return { valid: false, reason: 'Refresh token invalide' };
    }
    
    if (this.isTokenExpired(accessToken) && this.isTokenExpired(refreshToken)) {
      return { valid: false, reason: 'Tous les tokens sont expirés' };
    }
    
    return { valid: true };
  }
}