export interface SwotPdfExportUserSummary {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
}

export interface SwotPdfExportStrategySummary {
  id: string;
  businessName: string;
  industry: string;
}

export interface SwotPdfExportInputs {
  notesInternes?: string;
  notesExternes?: string;
  concurrents: string[];
  ressources: string[];
  objectifs?: string;
}

export interface SwotPdfMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface SwotPdfExportPayload {
  swotId: string;
  fileName: string;
  title: string;
  exportedAt: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  user: SwotPdfExportUserSummary;
  strategy: SwotPdfExportStrategySummary;
  inputs: SwotPdfExportInputs;
  matrix: SwotPdfMatrix;
}
