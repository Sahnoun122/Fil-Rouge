import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SwotDocument = Swot & Document;

@Schema({ _id: false })
export class SwotInputs {
  @Prop()
  notesInternes?: string;

  @Prop()
  notesExternes?: string;

  @Prop({ type: [String], default: [] })
  concurrents?: string[];

  @Prop({ type: [String], default: [] })
  ressources?: string[];

  @Prop()
  objectifs?: string;
}

@Schema({ _id: false })
export class SwotAnalysis {
  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  weaknesses: string[];

  @Prop({ type: [String], default: [] })
  opportunities: string[];

  @Prop({ type: [String], default: [] })
  threats: string[];
}

@Schema({
  timestamps: true,
  collection: 'swots',
})
export class Swot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Strategy', required: true })
  strategyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: SwotInputs, default: {} })
  inputs: SwotInputs;

  @Prop({ type: SwotAnalysis, default: {} })
  swot: SwotAnalysis;

  @Prop({ type: Boolean, default: false })
  isAiGenerated: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SwotSchema = SchemaFactory.createForClass(Swot);

SwotSchema.index({ userId: 1 });
SwotSchema.index({ strategyId: 1 });
