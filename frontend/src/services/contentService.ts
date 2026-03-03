import { fetcher } from '@/src/utils/fetcher';
import {
  AutoScheduleCampaignDto,
  ContentCampaign,
  ContentCampaignsList,
  CreateContentCampaignDto,
  GenerateContentDto,
  RegeneratePlatformDto,
  RegeneratePostDto,
  UpdateContentCampaignDto,
} from '@/src/types/content.types';

class ContentService {
  async listCampaigns(page = 1, limit = 10): Promise<ContentCampaignsList> {
    const response = await fetcher<ContentCampaignsList>(
      `/content/campaigns?page=${page}&limit=${limit}`,
      { method: 'GET', requireAuth: true },
    );

    if (!response.data) {
      throw new Error('Aucune donnee de campagnes recue');
    }

    return response.data;
  }

  async getCampaign(id: string): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>(`/content/campaigns/${id}`, {
      method: 'GET',
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error('Campagne introuvable');
    }

    return response.data;
  }

  async createCampaign(payload: CreateContentCampaignDto): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>('/content/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error('Creation de campagne echouee');
    }

    return response.data;
  }

  async updateCampaign(id: string, payload: UpdateContentCampaignDto): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>(`/content/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error('Mise a jour de campagne echouee');
    }

    return response.data;
  }

  async generateCampaign(id: string, payload?: GenerateContentDto): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>(`/content/campaigns/${id}/generate`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error('Generation de contenu echouee');
    }

    return response.data;
  }

  async autoScheduleCampaign(
    id: string,
    payload: AutoScheduleCampaignDto,
  ): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>(
      `/content/campaigns/${id}/auto-schedule`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        requireAuth: true,
      },
    );

    if (!response.data) {
      throw new Error('Generation du planning automatique echouee');
    }

    return response.data;
  }

  async regeneratePlatform(id: string, payload: RegeneratePlatformDto): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>(`/content/campaigns/${id}/regenerate-platform`, {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error('Regeneration plateforme echouee');
    }

    return response.data;
  }

  async regeneratePost(id: string, payload: RegeneratePostDto): Promise<ContentCampaign> {
    const response = await fetcher<ContentCampaign>(`/content/campaigns/${id}/regenerate-post`, {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error('Regeneration post echouee');
    }

    return response.data;
  }

  async deleteCampaign(id: string): Promise<void> {
    await fetcher(`/content/campaigns/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }
}

export const contentService = new ContentService();
