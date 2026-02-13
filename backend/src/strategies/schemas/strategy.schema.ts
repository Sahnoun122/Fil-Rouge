import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StrategyDocument = Strategy & Document;

// Enum pour les objectifs principaux
export enum MainObjective {
  LEADS = 'leads',
  SALES = 'sales', 
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
}

// Enum pour le ton de communication
export enum Tone {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  LUXURY = 'luxury',
  YOUNG = 'young',
}

// Schéma pour les informations business
@Schema({ _id: false })
export class BusinessInfo {
  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  productOrService: string;

  @Prop({ required: true })
  targetAudience: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, enum: MainObjective })
  mainObjective: MainObjective;

  @Prop({ required: true, enum: Tone })
  tone: Tone;

  @Prop()
  budget?: number;
}

// Schéma pour le marché cible
@Schema({ _id: false })
export class MarcheCible {
  @Prop({ required: true })
  persona: string;

  @Prop({ type: [String], required: true })
  besoins: string[];

  @Prop({ type: [String], required: true })
  problemes: string[];

  @Prop({ type: [String], required: true })
  comportementDigital: string[];
}

// Schéma pour le message marketing
@Schema({ _id: false })
export class MessageMarketing {
  @Prop({ required: true })
  propositionValeur: string;

  @Prop({ required: true })
  messagePrincipal: string;

  @Prop({ required: true })
  tonCommunication: string;
}

// Schéma pour les types de contenu par plateforme
@Schema({ _id: false })
export class TypesContenu {
  @Prop({ type: [String], default: [] })
  instagram: string[];

  @Prop({ type: [String], default: [] })
  tiktok: string[];

  @Prop({ type: [String], default: [] })
  linkedin: string[];

  @Prop({ type: [String], default: [] })
  facebook: string[];
}

// Schéma pour les canaux de communication
@Schema({ _id: false })
export class CanauxCommunication {
  @Prop({ type: [String], required: true })
  plateformes: string[];

  @Prop({ type: TypesContenu, required: true })
  typesContenu: TypesContenu;
}

// Schéma pour la capture de prospects
@Schema({ _id: false })
export class CaptureProspects {
  @Prop({ required: true })
  landingPage: string;

  @Prop({ required: true })
  formulaire: string;

  @Prop({ type: [String], required: true })
  offreIncitative: string[];
}

// Schéma pour le nurturing
@Schema({ _id: false })
export class Nurturing {
  @Prop({ type: [String], required: true })
  sequenceEmails: string[];

  @Prop({ type: [String], required: true })
  contenusEducatifs: string[];

  @Prop({ type: [String], required: true })
  relances: string[];
}

// Schéma pour la conversion
@Schema({ _id: false })
export class Conversion {
  @Prop({ type: [String], required: true })
  cta: string[];

  @Prop({ type: [String], required: true })
  offres: string[];

  @Prop({ type: [String], required: true })
  argumentaireVente: string[];
}

// Schéma pour l'expérience client
@Schema({ _id: false })
export class ExperienceClient {
  @Prop({ type: [String], required: true })
  recommendations: string[];
}

// Schéma pour l'augmentation de la valeur client
@Schema({ _id: false })
export class AugmentationValeurClient {
  @Prop({ type: [String], required: true })
  upsell: string[];

  @Prop({ type: [String], required: true })
  crossSell: string[];

  @Prop({ type: [String], required: true })
  fidelite: string[];
}

// Schéma pour les recommandations
@Schema({ _id: false })
export class Recommandation {
  @Prop({ type: [String], required: true })
  parrainage: string[];

  @Prop({ type: [String], required: true })
  avisClients: string[];

  @Prop({ type: [String], required: true })
  recompenses: string[];
}

// Schéma pour la phase "Avant"
@Schema({ _id: false })
export class Avant {
  @Prop({ type: MarcheCible, required: true })
  marcheCible: MarcheCible;

  @Prop({ type: MessageMarketing, required: true })
  messageMarketing: MessageMarketing;

  @Prop({ type: CanauxCommunication, required: true })
  canauxCommunication: CanauxCommunication;
}

// Schéma pour la phase "Pendant"
@Schema({ _id: false })
export class Pendant {
  @Prop({ type: CaptureProspects, required: true })
  captureProspects: CaptureProspects;

  @Prop({ type: Nurturing, required: true })
  nurturing: Nurturing;

  @Prop({ type: Conversion, required: true })
  conversion: Conversion;
}

// Schéma pour la phase "Après"
@Schema({ _id: false })
export class Apres {
  @Prop({ type: ExperienceClient, required: true })
  experienceClient: ExperienceClient;

  @Prop({ type: AugmentationValeurClient, required: true })
  augmentationValeurClient: AugmentationValeurClient;

  @Prop({ type: Recommandation, required: true })
  recommandation: Recommandation;
}

// Schéma pour la stratégie générée complète
@Schema({ _id: false })
export class GeneratedStrategy {
  @Prop({ type: Avant, required: true })
  avant: Avant;

  @Prop({ type: Pendant, required: true })
  pendant: Pendant;

  @Prop({ type: Apres, required: true })
  apres: Apres;
}

// Schéma principal pour la stratégie
@Schema({ 
  timestamps: true,
  collection: 'strategies'
})
export class Strategy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: BusinessInfo, required: true })
  businessInfo: BusinessInfo;

  @Prop({ type: GeneratedStrategy, required: true })
  generatedStrategy: GeneratedStrategy;

  // Ajouté automatiquement par Mongoose avec timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const StrategySchema = SchemaFactory.createForClass(Strategy);