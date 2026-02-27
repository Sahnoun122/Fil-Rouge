import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContentCampaignDocument = ContentCampaign & Document;

export enum ContentMode {
  ADS = 'ADS',
  CONTENT_MARKETING = 'CONTENT_MARKETING',
}

export enum ContentObjective {
  LEADS = 'leads',
  SALES = 'sales',
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
}

@Schema({ _id: false })
export class ContentCampaignInputs {
  @Prop()
  productOffer?: string;

  @Prop()
  targetAudience?: string;

  @Prop()
  tone?: string;

  @Prop()
  callToAction?: string;

  @Prop()
  promoDetails?: string;

  @Prop()
  budget?: number;

  @Prop({ type: [String], default: [] })
  contentPillars?: string[];

  @Prop()
  frequencyPerWeek?: number;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: [String], default: [] })
  platforms?: string[];
}

@Schema({ _id: false })
export class PostSchedule {
  @Prop()
  date: string;

  @Prop()
  time: string;
}

@Schema({ _id: true, id: false })
export class GeneratedPost {
  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  title?: string;

  @Prop({ required: true })
  caption: string;

  @Prop({ type: [String], default: [] })
  hashtags?: string[];

  @Prop()
  hook?: string;

  @Prop()
  cta?: string;

  @Prop()
  adCopyVariantA?: string;

  @Prop()
  adCopyVariantB?: string;

  @Prop()
  adCopyVariantC?: string;

  @Prop()
  suggestedVisual?: string;

  @Prop({ type: PostSchedule })
  schedule?: PostSchedule;
}

@Schema({ _id: false })
export class PostingPlan {
  @Prop()
  frequencyPerWeek?: number;

  @Prop()
  durationWeeks?: number;
}

@Schema({ _id: false })
export class CampaignSummary {
  @Prop({ type: [String], default: [] })
  contentPillars?: string[];

  @Prop({ type: PostingPlan, default: {} })
  postingPlan?: PostingPlan;
}

@Schema({
  timestamps: true,
  collection: 'content_campaigns',
})
export class ContentCampaign {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Strategy', required: true })
  strategyId: Types.ObjectId;

  @Prop({ type: String, enum: ContentMode, required: true })
  mode: ContentMode;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ContentObjective, required: true })
  objective: ContentObjective;

  @Prop({ type: [String], default: [] })
  platforms: string[];

  @Prop({ type: ContentCampaignInputs, default: {} })
  inputs?: ContentCampaignInputs;

  @Prop({ type: CampaignSummary, default: {} })
  campaignSummary?: CampaignSummary;

  @Prop({ type: [GeneratedPost], default: [] })
  generatedPosts: GeneratedPost[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ContentCampaignSchema = SchemaFactory.createForClass(ContentCampaign);

ContentCampaignSchema.index({ userId: 1, createdAt: -1 });
ContentCampaignSchema.index({ strategyId: 1 });
