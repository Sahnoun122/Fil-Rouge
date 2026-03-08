import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
}

export enum NotificationReminderType {
  BEFORE_60_MIN = 'BEFORE_60_MIN',
  BEFORE_30_MIN = 'BEFORE_30_MIN',
  BEFORE_10_MIN = 'BEFORE_10_MIN',
}

@Schema({
  timestamps: true,
  collection: 'notifications',
})
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ScheduledPost', required: true })
  postId: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, enum: NotificationReminderType, required: true })
  reminderType: NotificationReminderType;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  message: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  sentAt?: Date | null;

  @Prop({ type: Date, required: true })
  scheduledFor: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index(
  {
    userId: 1,
    postId: 1,
    type: 1,
    reminderType: 1,
    scheduledFor: 1,
  },
  { unique: true },
);
NotificationSchema.index({ userId: 1, type: 1, sentAt: -1 });
NotificationSchema.index({ sentAt: 1, scheduledFor: 1 });
