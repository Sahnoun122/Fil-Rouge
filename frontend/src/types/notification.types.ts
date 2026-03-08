export type NotificationReminderType =
  | "BEFORE_60_MIN"
  | "BEFORE_30_MIN"
  | "BEFORE_10_MIN";

export type NotificationType = "IN_APP" | "EMAIL";

export interface NotificationItem {
  _id: string;
  userId: string;
  postId: string;
  type: NotificationType;
  reminderType: NotificationReminderType;
  title: string;
  message: string;
  isRead: boolean;
  sentAt?: string | null;
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
}
