// Types pour les stratégies marketing - Basés sur le schéma backend

// Enums
export enum MainObjective {
  LEADS = 'leads',
  SALES = 'sales',
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
}

export enum Tone {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  LUXURY = 'luxury',
  YOUNG = 'young',
}

// Types pour le formulaire de génération
export interface GenerateStrategyDto {
  businessName: string;
  industry: string;
  productOrService: string;
  targetAudience: string;
  location: string;
  mainObjective: MainObjective;
  tone: Tone;
  budget?: number;
  language?: string;
}

// Types pour les informations business
export interface BusinessInfo {
  businessName: string;
  industry: string;
  productOrService: string;
  targetAudience: string;
  location: string;
  mainObjective: MainObjective;
  tone: Tone;
  budget?: number;
  language?: string;
}

// Types pour la structure de la stratégie générée
export interface MarcheCible {
  persona: string;
  besoins: string[];
  problemes: string[];
  comportementDigital: string[];
}

export interface MessageMarketing {
  propositionValeur: string;
  messagePrincipal: string;
  tonCommunication: string;
}

export interface TypesContenu {
  instagram: string[];
  tiktok: string[];
  linkedin: string[];
  facebook: string[];
}

export interface CanauxCommunication {
  plateformes: string[];
  typesContenu: TypesContenu;
}

export interface CaptureProspects {
  landingPage: string;
  formulaire: string;
  offreIncitative: string[];
}

export interface Nurturing {
  sequenceEmails: string[];
  contenusEducatifs: string[];
  relances: string[];
}

export interface Conversion {
  cta: string[];
  offres: string[];
  argumentaireVente: string[];
}

export interface ExperienceClient {
  recommendations: string[];
}

export interface AugmentationValeurClient {
  upsell: string[];
  crossSell: string[];
  fidelite: string[];
}

export interface Recommandation {
  parrainage: string[];
  avisClients: string[];
  recompenses: string[];
}

// Phases de la stratégie
export interface Avant {
  marcheCible: MarcheCible;
  messageMarketing: MessageMarketing;
  canauxCommunication: CanauxCommunication;
}

export interface Pendant {
  captureProspects: CaptureProspects;
  nurturing: Nurturing;
  conversion: Conversion;
}

export interface Apres {
  experienceClient: ExperienceClient;
  augmentationValeurClient: AugmentationValeurClient;
  recommandation: Recommandation;
}

export interface GeneratedStrategy {
  avant: Avant;
  pendant: Pendant;
  apres: Apres;
}

// Type principal pour une stratégie complète
export interface Strategy {
  _id: string;
  userId: string;
  businessInfo: BusinessInfo;
  generatedStrategy: GeneratedStrategy;
  createdAt: string;
  updatedAt: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface StrategiesResponse {
  strategies: Strategy[];
  pagination: PaginationInfo;
}

// Types pour les DTOs de mise à jour
export interface RegenerateSectionDto {
  sectionKey: string;
  instruction?: string;
}

export interface ImproveSectionDto {
  sectionKey: string;
  feedback: string;
  improvementType: 'enhance' | 'simplify' | 'detail';
}

export interface UpdateSectionDto {
  sectionKey: string;
  newContent: any;
}

// Utilitaires pour l'état de chargement
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface StrategyLoadingState extends LoadingState {
  isGenerating: boolean;
  isRegenerating: boolean;
  isImproving: boolean;
}

// Labels pour l'affichage
export const OBJECTIVE_LABELS: Record<MainObjective, string> = {
  [MainObjective.LEADS]: 'Génération de leads',
  [MainObjective.SALES]: 'Augmentation des ventes',
  [MainObjective.AWARENESS]: 'Notoriété de marque',
  [MainObjective.ENGAGEMENT]: 'Engagement client',
};

export const TONE_LABELS: Record<Tone, string> = {
  [Tone.FRIENDLY]: 'Amical',
  [Tone.PROFESSIONAL]: 'Professionnel',
  [Tone.LUXURY]: 'Luxe',
  [Tone.YOUNG]: 'Jeune',
};

// Options pour les selects
export const OBJECTIVE_OPTIONS = Object.entries(OBJECTIVE_LABELS).map(([value, label]) => ({
  value: value as MainObjective,
  label,
}));

export const TONE_OPTIONS = Object.entries(TONE_LABELS).map(([value, label]) => ({
  value: value as Tone,
  label,
}));

// Langues prises en charge pour la génération IA
export const LANGUAGE_OPTIONS = [
  { value: 'French', label: 'Français' },
  { value: 'English', label: 'English' },
  { value: 'Arabic', label: 'العربية' },
  { value: 'Spanish', label: 'Español' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Italian', label: 'Italiano' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Dutch', label: 'Nederlands' },
  { value: 'Russian', label: 'Русский' },
  { value: 'Turkish', label: 'Türkçe' },
  { value: 'Chinese', label: '中文' },
  { value: 'Japanese', label: '日本語' },
];
