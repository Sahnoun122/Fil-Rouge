// Hook personnalisé pour la gestion des stratégies
import { useState, useEffect, useCallback } from 'react';
import {
  Strategy,
  GenerateStrategyDto,
  StrategiesResponse,
  StrategyLoadingState,
  RegenerateSectionDto,
  ImproveSectionDto,
  UpdateSectionDto,
  BusinessInfo,
} from '../types/strategy.types';
import strategiesService from '../services/strategiesService';

// Hook pour une stratégie individuelle
export const useStrategy = (id?: string) => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [state, setState] = useState<StrategyLoadingState>({
    isLoading: false,
    isGenerating: false,
    isRegenerating: false,
    isImproving: false,
    error: null,
  });

  // Charger une stratégie spécifique
  const loadStrategy = useCallback(async (strategyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await strategiesService.getStrategy(strategyId);
      setStrategy(data);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Régénérer une section
  const regenerateSection = useCallback(async (
    strategyId: string,
    data: RegenerateSectionDto
  ) => {
    setState(prev => ({ ...prev, isRegenerating: true, error: null }));
    
    try {
      const updatedStrategy = await strategiesService.regenerateSection(strategyId, data);
      setStrategy(updatedStrategy);
      return updatedStrategy;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Échec de la régénération'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isRegenerating: false }));
    }
  }, []);

  // Améliorer une section
  const improveSection = useCallback(async (
    strategyId: string,
    data: ImproveSectionDto
  ) => {
    setState(prev => ({ ...prev, isImproving: true, error: null }));
    
    try {
      const updatedStrategy = await strategiesService.improveSection(strategyId, data);
      setStrategy(updatedStrategy);
      return updatedStrategy;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Échec de l\'amélioration'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isImproving: false }));
    }
  }, []);

  // Mettre à jour une section
  const updateSection = useCallback(async (
    strategyId: string,
    data: UpdateSectionDto
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedStrategy = await strategiesService.updateSection(strategyId, data);
      setStrategy(updatedStrategy);
      return updatedStrategy;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Échec de la mise à jour'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Charger automatiquement la stratégie si un ID est fourni
  useEffect(() => {
    if (id) {
      loadStrategy(id);
    }
  }, [id, loadStrategy]);

  return {
    strategy,
    ...state,
    loadStrategy,
    regenerateSection,
    improveSection,
    updateSection,
  };
};

// Hook pour la liste des stratégies
export const useStrategiesList = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [state, setState] = useState<StrategyLoadingState>({
    isLoading: false,
    isGenerating: false,
    isRegenerating: false,
    isImproving: false,
    error: null,
  });

  // Charger les stratégies avec pagination
  const loadStrategies = useCallback(async (page = 1, limit = 10) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await strategiesService.getAllStrategies(page, limit);
      setStrategies(data.strategies);
      setPagination(data.pagination);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Échec du chargement des stratégies'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Générer une nouvelle stratégie
  const generateStrategy = useCallback(async (data: GenerateStrategyDto) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    
    try {
      const newStrategy = await strategiesService.generateFullStrategy(data);
      // Recharger la liste après génération
      await loadStrategies(pagination.page, pagination.limit);
      return newStrategy;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Échec de la génération de stratégie'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [pagination.page, pagination.limit, loadStrategies]);

  // Supprimer une stratégie
  const deleteStrategy = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await strategiesService.deleteStrategy(id);
      // Recharger la liste après suppression
      await loadStrategies(pagination.page, pagination.limit);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Échec de la suppression'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [pagination.page, pagination.limit, loadStrategies]);

  // Changer de page
  const changePage = useCallback((newPage: number) => {
    loadStrategies(newPage, pagination.limit);
  }, [pagination.limit, loadStrategies]);

  // Changer la limite par page
  const changeLimit = useCallback((newLimit: number) => {
    loadStrategies(1, newLimit); // Retour à la page 1 quand on change la limite
  }, [loadStrategies]);

  // Actualiser la liste
  const refresh = useCallback(() => {
    loadStrategies(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit, loadStrategies]);

  // Charger automatiquement les stratégies au montage
  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  return {
    strategies,
    pagination,
    ...state,
    loadStrategies,
    generateStrategy,
    deleteStrategy,
    changePage,
    changeLimit,
    refresh,
  };
};

// Hook pour les opérations rapides sur une stratégie
export const useStrategyActions = () => {
  const [state, setState] = useState<StrategyLoadingState>({
    isLoading: false,
    isGenerating: false,
    isRegenerating: false,
    isImproving: false,
    error: null,
  });

  // Action générique avec gestion d'état
  const performAction = useCallback(async <T>(
    action: () => Promise<T>,
    loadingKey: keyof Omit<StrategyLoadingState, 'error'>
  ): Promise<T> => {
    setState(prev => ({ ...prev, [loadingKey]: true, error: null }));
    
    try {
      return await action();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  // Supprimer une stratégie (action rapide)
  const quickDelete = useCallback(async (id: string) => {
    return performAction(
      () => strategiesService.deleteStrategy(id),
      'isLoading'
    );
  }, [performAction]);

  // Générer une stratégie (action rapide)
  const quickGenerate = useCallback(async (data: GenerateStrategyDto) => {
    return performAction(
      () => strategiesService.generateFullStrategy(data),
      'isGenerating'
    );
  }, [performAction]);

  // Effacer les erreurs
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    quickDelete,
    quickGenerate,
    clearError,
  };
};

// Hook de compatibilité utilisé par les pages de détail/édition
export const useStrategies = () => {
  const [state, setState] = useState<StrategyLoadingState>({
    isLoading: false,
    isGenerating: false,
    isRegenerating: false,
    isImproving: false,
    error: null,
  });

  const regenerateSection = useCallback(
    async (strategyId: string, sectionKey: string, instruction?: string) => {
      setState((prev) => ({ ...prev, isRegenerating: true, error: null }));
      try {
        return await strategiesService.regenerateSection(strategyId, {
          sectionKey,
          instruction,
          additionalContext: instruction,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Échec de la régénération',
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isRegenerating: false }));
      }
    },
    [],
  );

  const deleteStrategy = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await strategiesService.deleteStrategy(id);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Échec de la suppression',
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // L'API backend actuelle n'expose pas de route pour modifier businessInfo.
  const updateStrategy = useCallback(async (_id: string, _data: BusinessInfo) => {
    throw new Error("La mise à jour globale de la stratégie n'est pas encore disponible côté API.");
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    regenerateSection,
    deleteStrategy,
    updateStrategy,
    clearError,
  };
};

// Export du hook principal
export default useStrategiesList;
