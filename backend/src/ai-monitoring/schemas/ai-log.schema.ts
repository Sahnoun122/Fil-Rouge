import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const AI_FEATURE_TYPES = [
  'strategy',
  'swot',
  'content',
  'planning',
] as const;

export type AiFeatureType = (typeof AI_FEATURE_TYPES)[number];

export const AI_LOG_STATUSES = ['success', 'failed'] as const;
export type AiLogStatus = (typeof AI_LOG_STATUSES)[number];

export type AiLogDocument = AiLog & Document;

@Schema({
  timestamps: true,
  collection: 'ai_logs',
})
export class AiLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AI_FEATURE_TYPES, required: true, index: true })
  featureType: AiFeatureType;

  @Prop({ required: true, trim: true, maxlength: 120, index: true })
  actionType: string;

  @Prop({ trim: true, maxlength: 120 })
  relatedEntityId?: string;

  @Prop({ type: String, enum: AI_LOG_STATUSES, required: true, index: true })
  status: AiLogStatus;

  @Prop({ trim: true, maxlength: 3000 })
  inputSummary?: string;

  @Prop({ trim: true, maxlength: 4000 })
  responseSummary?: string;

  @Prop({ trim: true, maxlength: 150 })
  modelName?: string;

  @Prop({ type: Number, min: 0 })
  responseTimeMs?: number;

  @Prop({ trim: true, maxlength: 3000 })
  errorMessage?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AiLogSchema = SchemaFactory.createForClass(AiLog);

AiLogSchema.index({ createdAt: -1 });
AiLogSchema.index({ userId: 1, createdAt: -1 });
AiLogSchema.index({ featureType: 1, createdAt: -1 });
AiLogSchema.index({ status: 1, createdAt: -1 });
AiLogSchema.index({ actionType: 1, createdAt: -1 });
AiLogSchema.index({ userId: 1, featureType: 1, createdAt: -1 });
