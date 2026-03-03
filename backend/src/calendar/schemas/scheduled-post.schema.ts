import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduledPostDocument = HydratedDocument<ScheduledPost>;

export enum CalendarPlatform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest',
}

export enum ScheduledPostType {
  POST = 'post',
  REEL = 'reel',
  STORY = 'story',
  TIKTOK = 'tiktok',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
  AD = 'ad',
}

export enum ScheduledPostStatus {
  PLANNED = 'planned',
  PUBLISHED = 'published',
  LATE = 'late',
}

@Schema({
  timestamps: true,
  collection: 'scheduled_posts',
})
export class ScheduledPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Strategy', default: null })
  strategyId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'ContentCampaign', default: null })
  campaignId?: Types.ObjectId | null;

  @Prop({ type: String, enum: CalendarPlatform, required: true })
  platform: CalendarPlatform;

  @Prop({ type: String, enum: ScheduledPostType, required: true })
  postType: ScheduledPostType;

  @Prop({ type: String, trim: true, maxlength: 160, default: null })
  title?: string | null;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  caption: string;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [String], default: [] })
  mediaUrls?: string[];

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({
    type: String,
    enum: ScheduledPostStatus,
    default: ScheduledPostStatus.PLANNED,
  })
  status: ScheduledPostStatus;

  @Prop({ required: true, trim: true, maxlength: 100 })
  timezone: string;

  @Prop({ type: String, trim: true, maxlength: 2000, default: null })
  notes?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ScheduledPostSchema = SchemaFactory.createForClass(ScheduledPost);

ScheduledPostSchema.index({ userId: 1, scheduledAt: 1 });
ScheduledPostSchema.index({ userId: 1, platform: 1 });
