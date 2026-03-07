// Service API pour les stratégies marketing
import {
  Strategy,
  BusinessInfo,
  GenerateStrategyDto,
  ApiResponse,
  StrategiesResponse,
  RegenerateSectionDto,
  ImproveSectionDto,
  UpdateSectionDto,
  StrategyPdfExportPayload,
} from '../types/strategy.types';
import { TokenManager } from '../utils/fetcher';

class StrategiesService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  private normalizeToken(token: string): string {
    return token.replace(/^Bearer\s+/i, '').trim();
  }

  // Utilitaire pour récupérer le token d'authentification
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    const accessToken = TokenManager.getAccessToken();
    if (accessToken) return this.normalizeToken(accessToken);

    // Compatibilité avec anciens builds qui stockaient "token".
    const legacyToken = localStorage.getItem('token');
    if (!legacyToken) return null;

    const normalized = this.normalizeToken(legacyToken);
    localStorage.setItem('accessToken', normalized);
    return normalized;
  }

  // Utilitaire pour les headers avec authentification
  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Utilitaire pour gérer les erreurs API
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP Error: ${response.status}`;
      throw new Error(message);
    }
    return response.json();
  }

  /**
   * Génère une stratégie marketing complète
   */
  async generateFullStrategy(data: GenerateStrategyDto): Promise<Strategy> {
    try {
      const response = await fetch(`${this.baseURL}/strategies/generate-full`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<ApiResponse<Strategy>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la génération de la stratégie:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les stratégies de l'utilisateur avec pagination
   */
  async getAllStrategies(page = 1, limit = 10): Promise<StrategiesResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/strategies?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse<ApiResponse<StrategiesResponse>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors du chargement des stratégies:', error);
      throw error;
    }
  }

  /**
   * Récupère une stratégie spécifique par son ID
   */
  async getStrategy(id: string): Promise<Strategy> {
    try {
      const response = await fetch(`${this.baseURL}/strategies/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<ApiResponse<Strategy>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la stratégie:', error);
      throw error;
    }
  }

  /**
   * Récupère les données structurées pour l'export PDF d'une stratégie
   */
  async getStrategyPdfPayload(id: string): Promise<StrategyPdfExportPayload> {
    try {
      const response = await fetch(`${this.baseURL}/strategies/${id}/export-pdf`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<ApiResponse<StrategyPdfExportPayload>>(response);
      return result.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données d'export PDF:", error);
      throw error;
    }
  }

  /**
   * Supprime une stratégie spécifique
   */
  async deleteStrategy(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/strategies/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      await this.handleResponse<ApiResponse<void>>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la stratégie:', error);
      throw error;
    }
  }

  /**
   * Met à jour les informations business d'une stratégie
   */
  async updateStrategy(strategyId: string, data: BusinessInfo): Promise<Strategy> {
    try {
      const response = await fetch(`${this.baseURL}/strategies/${strategyId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<ApiResponse<Strategy>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la stratégie:', error);
      throw error;
    }
  }

  /**
   * Régénère une section spécifique de la stratégie
   */
  async regenerateSection(
    strategyId: string,
    data: RegenerateSectionDto
  ): Promise<Strategy> {
    try {
      const response = await fetch(
        `${this.baseURL}/strategies/${strategyId}/regenerate-section`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      const result = await this.handleResponse<ApiResponse<Strategy>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la régénération de la section:', error);
      throw error;
    }
  }

  /**
   * Améliore une section spécifique de la stratégie
   */
  async improveSection(
    strategyId: string,
    data: ImproveSectionDto
  ): Promise<Strategy> {
    try {
      const response = await fetch(
        `${this.baseURL}/strategies/${strategyId}/improve-section`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      const result = await this.handleResponse<ApiResponse<Strategy>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors de l\'amélioration de la section:', error);
      throw error;
    }
  }

  /**
   * Met à jour manuellement une section spécifique de la stratégie
   */
  async updateSection(
    strategyId: string,
    data: UpdateSectionDto
  ): Promise<Strategy> {
    try {
      const response = await fetch(
        `${this.baseURL}/strategies/${strategyId}/update-section`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      const result = await this.handleResponse<ApiResponse<Strategy>>(response);
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la section:', error);
      throw error;
    }
  }

  /**
   * Utilitaire pour vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Instance singleton du service
export const strategiesService = new StrategiesService();
export default strategiesService;
