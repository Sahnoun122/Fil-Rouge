export interface BusinessForm {
  companyName: string;
  industry: string;
  productOrService: string;
  targetAudience: string;
  objective: 'leads' | 'sales' | 'awareness' | 'engagement';
  location: string;
  tone: 'friendly' | 'professional' | 'luxury' | 'young';
  budget?: number;
}

export interface MarcheTargetSection {
  persona: string;
  besoins: string[];
  problemes: string[];
  comportementDigital: string[];
}

export interface MessageMarketingSection {
  propositionValeur: string;
  messagePrincipal: string;
  tonCommunication: string;
}

export interface CanauxCommunicationSection {
  plateformes: {
    platform: string;
    typesContenu: string[];
  }[];
}

export interface CaptureProspectsSection {
  landingPage: string;
  formulaire: string[];
  offreIncitative: string;
}

export interface NurturingSection {
  sequenceEmails: string[];
  contenusEducatifs: string[];
  relances: string[];
}

export interface ConversionSection {
  cta: string[];
  offres: string[];
  argumentaireVente: string;
}

export interface ExperienceClientSection {
  recommendations: string[];
}

export interface AugmentationValeurClientSection {
  upsell: string[];
  crossSell: string[];
  fidelite: string[];
}

export interface RecommandationSection {
  parrainage: string[];
  avisClients: string[];
  recompenses: string[];
}

export interface StrategyContentSection {
  title: string;
  content: string;
  isGenerated: boolean;
}

export interface AvantPhase {
  analyseBusiness: StrategyContentSection;
  analysePublic: StrategyContentSection;
  analyseConcurrence: StrategyContentSection;
  analyseSwot: StrategyContentSection;
}

export interface PendantPhase {
  strategyCreative: StrategyContentSection;
  planMedia: StrategyContentSection;
  planContenu: StrategyContentSection;
  kpiMetriques: StrategyContentSection;
}

export interface ApresPhase {
  planSuivi: StrategyContentSection;
  optimisations: StrategyContentSection;
  evolutionStrategy: StrategyContentSection;
  reportingAnalyse: StrategyContentSection;
}

export interface MarketingStrategy {
  id: string;
  businessForm: BusinessForm;
  createdAt: string;
  status?: 'draft' | 'in-progress' | 'completed';
  avant: AvantPhase;
  pendant: PendantPhase;
  apres: ApresPhase;
}

export interface RegenerateRequest {
  instruction: string;
  sectionKey: string;
  phaseKey: 'avant' | 'pendant' | 'apres';
}

export type TabKey = 'avant' | 'pendant' | 'apres';

export interface SectionCardProps {
  title: string;
  data: any;
  sectionKey: string;
  phaseKey: TabKey;
  onRegenerate: (sectionKey: string, phaseKey: TabKey) => void;
  onImprove: (sectionKey: string, phaseKey: TabKey) => void;
  onEdit: (sectionKey: string, phaseKey: TabKey) => void;
}

export interface GenerationProgress {
  phase: string;
  section: string;
  isComplete: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: GenerationProgress[];
  currentPhase: string;
  currentSection: string;
}