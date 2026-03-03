import { fetcher } from "@/src/utils/fetcher";
import type {
  CampaignOption,
  CreateScheduledPostDto,
  ListScheduledPostsParams,
  MoveScheduledPostDto,
  ScheduledPost,
  ScheduledPostsResponse,
  StrategyOption,
  UpdateScheduledPostDto,
} from "@/src/types/calendar.types";

interface StrategiesListResponse {
  strategies: StrategyOption[];
}

interface CampaignsListResponse {
  campaigns: CampaignOption[];
}

class CalendarService {
  async listPosts(
    params: ListScheduledPostsParams,
  ): Promise<ScheduledPostsResponse> {
    const searchParams = new URLSearchParams({
      rangeStart: params.rangeStart,
      rangeEnd: params.rangeEnd,
    });

    if (params.platform) {
      searchParams.set("platform", params.platform);
    }

    if (params.status) {
      searchParams.set("status", params.status);
    }

    if (params.page !== undefined) {
      searchParams.set("page", String(params.page));
    }

    if (params.limit !== undefined) {
      searchParams.set("limit", String(params.limit));
    }

    const response = await fetcher<ScheduledPostsResponse>(
      `/calendar/posts?${searchParams.toString()}`,
      {
        method: "GET",
        requireAuth: true,
      },
    );

    if (!response.data) {
      throw new Error("Aucune donnee calendrier recue");
    }

    return response.data;
  }

  async getPost(id: string): Promise<ScheduledPost> {
    const response = await fetcher<ScheduledPost>(`/calendar/posts/${id}`, {
      method: "GET",
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error("Publication introuvable");
    }

    return response.data;
  }

  async createPost(payload: CreateScheduledPostDto): Promise<ScheduledPost> {
    const response = await fetcher<ScheduledPost>("/calendar/posts", {
      method: "POST",
      body: JSON.stringify(payload),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error("Creation de publication echouee");
    }

    return response.data;
  }

  async updatePost(
    id: string,
    payload: UpdateScheduledPostDto,
  ): Promise<ScheduledPost> {
    const response = await fetcher<ScheduledPost>(`/calendar/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error("Mise a jour de publication echouee");
    }

    return response.data;
  }

  async movePost(
    id: string,
    payload: MoveScheduledPostDto,
  ): Promise<ScheduledPost> {
    const response = await fetcher<ScheduledPost>(
      `/calendar/posts/${id}/move`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        requireAuth: true,
      },
    );

    if (!response.data) {
      throw new Error("Deplacement de publication echoue");
    }

    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await fetcher(`/calendar/posts/${id}`, {
      method: "DELETE",
      requireAuth: true,
    });
  }

  async listStrategies(): Promise<StrategyOption[]> {
    const response = await fetcher<StrategiesListResponse>(
      "/strategies?page=1&limit=100",
      {
        method: "GET",
        requireAuth: true,
      },
    );

    return response.data?.strategies ?? [];
  }

  async listCampaigns(): Promise<CampaignOption[]> {
    const response = await fetcher<CampaignsListResponse>(
      "/content/campaigns?page=1&limit=100",
      {
        method: "GET",
        requireAuth: true,
      },
    );

    return response.data?.campaigns ?? [];
  }
}

export const calendarService = new CalendarService();
