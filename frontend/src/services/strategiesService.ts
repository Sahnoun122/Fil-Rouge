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
import { fetcher, TokenManager } from '../utils/fetcher';

class StrategiesService {
  /**
   * Génère une stratégie marketing complète
   */
  async generateFullStrategy(data: GenerateStrategyDto): Promise<Strategy> {
    try {
      const result = await fetcher<Strategy>('/strategies/generate-full', {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: true,
      });

      if (!result.data) {
        throw new Error('Aucune donnee de strategie recue');
      }

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
      const result = await fetcher<StrategiesResponse>(
        `/strategies?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          requireAuth: true,
        },
      );

      if (!result.data) {
        throw new Error('Aucune donnee de strategies recue');
      }

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
      const result = await fetcher<Strategy>(`/strategies/${id}`, {
        method: 'GET',
        requireAuth: true,
      });

      if (!result.data) {
        throw new Error('Strategie introuvable');
      }

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
      const result = await fetcher<StrategyPdfExportPayload>(
        `/strategies/${id}/export-pdf`,
        {
        method: 'GET',
          requireAuth: true,
        },
      );

      if (!result.data) {
        throw new Error("Aucune donnee d'export PDF recue");
      }

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
      await fetcher<ApiResponse<void>>(`/strategies/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });
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
      const result = await fetcher<Strategy>(`/strategies/${strategyId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        requireAuth: true,
      });

      if (!result.data) {
        throw new Error('Mise a jour de strategie echouee');
      }

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
      const result = await fetcher<Strategy>(
        `/strategies/${strategyId}/regenerate-section`,
        {
          method: 'POST',
          body: JSON.stringify(data),
          requireAuth: true,
        },
      );

      if (!result.data) {
        throw new Error('Regeneration de section echouee');
      }

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
      const result = await fetcher<Strategy>(
        `/strategies/${strategyId}/improve-section`,
        {
          method: 'POST',
          body: JSON.stringify(data),
          requireAuth: true,
        },
      );

      if (!result.data) {
        throw new Error('Amelioration de section echouee');
      }

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
      const result = await fetcher<Strategy>(
        `/strategies/${strategyId}/update-section`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
          requireAuth: true,
        },
      );

      if (!result.data) {
        throw new Error('Mise a jour de section echouee');
      }

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
    return !!TokenManager.getAccessToken();
  }
}

// Instance singleton du service
export const strategiesService = new StrategiesService();
export default strategiesService;
