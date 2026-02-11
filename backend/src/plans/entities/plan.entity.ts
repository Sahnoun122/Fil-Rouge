import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

export type PlanType = 'free' | 'pro' | 'business';

export interface PlanFeatures {
  maxStrategiesPerMonth: number;
  maxPublicationsPerMonth: number;
  maxSwotPerMonth: number;
  maxPdfExportsPerMonth: number;
  maxTeamMembers: number;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  advancedAnalytics: boolean;
  unlimitedExports: boolean;
}

@Schema({
  timestamps: true,
  collection: 'plans',
})
export class Plan {
  @Prop({
    required: true,
    unique: true,
    enum: ['free', 'pro', 'business'],
  })
  type: PlanType;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    required: true,
    min: 0,
  })
  monthlyPrice: number;

  @Prop({
    required: true,
    min: 0,
  })
  yearlyPrice: number;

  @Prop({
    type: {
      maxStrategiesPerMonth: { type: Number, required: true },
      maxPublicationsPerMonth: { type: Number, required: true },
      maxSwotPerMonth: { type: Number, required: true },
      maxPdfExportsPerMonth: { type: Number, required: true },
      maxTeamMembers: { type: Number, required: true },
      prioritySupport: { type: Boolean, required: true },
      customBranding: { type: Boolean, required: true },
      apiAccess: { type: Boolean, required: true },
      advancedAnalytics: { type: Boolean, required: true },
      unlimitedExports: { type: Boolean, required: true },
    },
    required: true,
  })
  features: PlanFeatures;

  @Prop({
    type: [String],
    default: [],
  })
  highlights: string[];

  @Prop({
    required: true,
    default: true,
  })
  isActive: boolean;

  @Prop({
    required: true,
    default: 1,
  })
  sortOrder: number;

  // 📅 Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);

// 📌 Index pour optimiser les requêtes
PlanSchema.index({ type: 1 }, { unique: true });
PlanSchema.index({ isActive: 1 });
PlanSchema.index({ sortOrder: 1 });