'use client';

import { useCallback, useEffect, useState } from 'react';
import { contentService } from '@/src/services/contentService';
import {
  ContentCampaign,
  ContentCampaignsList,
  CreateContentCampaignDto,
  GenerateContentDto,
  RegeneratePlatformDto,
  RegeneratePostDto,
  UpdateContentCampaignDto,
} from '@/src/types/content.types';

interface ContentCampaignState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const defaultPagination = {
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
};

export function useContentCampaignsList(initialPage = 1, initialLimit = 10) {
  const [campaigns, setCampaigns] = useState<ContentCampaign[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [state, setState] = useState<ContentCampaignState>({
    isLoading: false,
    isSubmitting: false,
    error: null,
  });

  const loadCampaigns = useCallback(async (page = initialPage, limit = initialLimit) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data: ContentCampaignsList = await contentService.listCampaigns(page, limit);
      setCampaigns(data.campaigns ?? []);
      setPagination(data.pagination ?? defaultPagination);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de chargement des campagnes',
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [initialLimit, initialPage]);

  const deleteCampaign = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      await contentService.deleteCampaign(id);
      await loadCampaigns(pagination.page, pagination.limit);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de suppression',
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [loadCampaigns, pagination.limit, pagination.page]);

  useEffect(() => {
    loadCampaigns(initialPage, initialLimit);
  }, [initialLimit, initialPage, loadCampaigns]);

  return {
    campaigns,
    pagination,
    ...state,
    loadCampaigns,
    deleteCampaign,
  };
}

export function useContentCampaign(id?: string) {
  const [campaign, setCampaign] = useState<ContentCampaign | null>(null);
  const [state, setState] = useState<ContentCampaignState>({
    isLoading: false,
    isSubmitting: false,
    error: null,
  });

  const loadCampaign = useCallback(async (campaignId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await contentService.getCampaign(campaignId);
      setCampaign(data);
      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de chargement de la campagne',
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const createCampaign = useCallback(async (payload: CreateContentCampaignDto) => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const data = await contentService.createCampaign(payload);
      setCampaign(data);
      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de creation de la campagne',
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const updateCampaign = useCallback(async (campaignId: string, payload: UpdateContentCampaignDto) => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const data = await contentService.updateCampaign(campaignId, payload);
      setCampaign(data);
      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de mise a jour de la campagne',
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const generateCampaign = useCallback(async (campaignId: string, payload?: GenerateContentDto) => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const data = await contentService.generateCampaign(campaignId, payload);
      setCampaign(data);
      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur de generation de contenu',
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const regeneratePlatform = useCallback(
    async (campaignId: string, payload: RegeneratePlatformDto) => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
      try {
        const data = await contentService.regeneratePlatform(campaignId, payload);
        setCampaign(data);
        return data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erreur de regeneration de plateforme',
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [],
  );

  const regeneratePost = useCallback(
    async (campaignId: string, payload: RegeneratePostDto) => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
      try {
        const data = await contentService.regeneratePost(campaignId, payload);
        setCampaign(data);
        return data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erreur de regeneration du post',
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [],
  );

  useEffect(() => {
    if (id) {
      void loadCampaign(id);
    }
  }, [id, loadCampaign]);

  return {
    campaign,
    ...state,
    loadCampaign,
    createCampaign,
    updateCampaign,
    generateCampaign,
    regeneratePlatform,
    regeneratePost,
  };
}
