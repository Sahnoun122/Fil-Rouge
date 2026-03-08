import { fetcher } from "@/src/utils/fetcher";
import type { NotificationItem } from "@/src/types/notification.types";

class NotificationsService {
  async listNotifications(): Promise<NotificationItem[]> {
    const response = await fetcher<NotificationItem[]>("/notifications", {
      method: "GET",
      requireAuth: true,
    });

    return response.data ?? [];
  }

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await fetcher<NotificationItem>(`/notifications/${id}/read`, {
      method: "PATCH",
      requireAuth: true,
    });

    if (!response.data) {
      throw new Error("Notification introuvable");
    }

    return response.data;
  }

  async markAllAsRead(): Promise<number> {
    const response = await fetcher<{ updatedCount: number }>(
      "/notifications/read-all",
      {
        method: "PATCH",
        requireAuth: true,
      },
    );

    return response.data?.updatedCount ?? 0;
  }
}

export const notificationsService = new NotificationsService();
