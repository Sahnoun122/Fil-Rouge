'use client';

import React from 'react';
import { Edit3, RefreshCw, Sparkles, Users, MessageSquare, Megaphone, UserPlus, Mail, ArrowRight, Heart, TrendingUp, Star, Target, BarChart, FileText, Eye } from 'lucide-react';
import { SectionCardProps } from '../../types/strategy';

const sectionIcons = {
  // Phase AVANT
  analyseBusiness: TrendingUp,
  analysePublic: Users,
  analyseConcurrence: Target,
  analyseSwot: BarChart,
  // Phase PENDANT
  strategyCreative: Sparkles,
  planMedia: Megaphone,
  planContenu: FileText,
  kpiMetriques: BarChart,
  // Phase APRES
  planSuivi: Eye,
  optimisations: RefreshCw,
  evolutionStrategy: TrendingUp,
  reportingAnalyse: BarChart,
  // Legacy (au cas où)
  marcheTarget: Users,
  messageMarketing: MessageSquare,
  canauxCommunication: Megaphone,
  captureProspects: UserPlus,
  nurturing: Mail,
  conversion: ArrowRight,
  experienceClient: Heart,
  augmentationValeurClient: TrendingUp,
  recommandation: Star
};

const sectionTitles = {
  // Phase AVANT
  analyseBusiness: 'Analyse Business',
  analysePublic: 'Analyse du Public',
  analyseConcurrence: 'Analyse de la Concurrence',
  analyseSwot: 'Analyse SWOT',
  // Phase PENDANT
  strategyCreative: 'Stratégie Créative',
  planMedia: 'Plan Média',
  planContenu: 'Plan de Contenu',
  kpiMetriques: 'KPI & Métriques',
  // Phase APRES
  planSuivi: 'Plan de Suivi',
  optimisations: 'Optimisations',
  evolutionStrategy: 'Évolution Stratégie',
  reportingAnalyse: 'Reporting & Analyse',
  // Legacy (au cas où)
  marcheTarget: 'Marché Cible',
  messageMarketing: 'Message Marketing',
  canauxCommunication: 'Canaux de Communication',
  captureProspects: 'Capture Prospects',
  nurturing: 'Nurturing',
  conversion: 'Conversion',
  experienceClient: 'Expérience Client',
  augmentationValeurClient: 'Augmentation Valeur Client',
  recommandation: 'Recommandation'
};

export const SectionCard: React.FC<SectionCardProps> = ({
  sectionKey,
  data,
  phaseKey,
  onRegenerate,
  onImprove,
  onEdit
}) => {
  const Icon = sectionIcons[sectionKey as keyof typeof sectionIcons] || FileText;
  const title = sectionTitles[sectionKey as keyof typeof sectionTitles] || sectionKey;

  const renderContent = () => {
    if (!data) return <p className="text-gray-500 text-sm">Aucune donnée disponible</p>;

    // Structure simple avec content textuel
    if (data.title && data.content) {
      return (
        <div className="space-y-3">
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {data.content}
            </div>
          </div>
          {data.isGenerated && (
            <div className="flex items-center text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Généré par IA
            </div>
          )}
        </div>
      );
    }

    // Fallback pour l'ancienne structure (si elle existe encore)
    return (
      <div className="text-sm text-gray-600">
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-2 rounded-xl mr-3">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      {/* Content */}
      <div className="mb-6">
        {renderContent()}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onEdit?.(sectionKey, phaseKey)}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Éditer
        </button>
        <button
          onClick={() => onRegenerate?.(sectionKey, phaseKey)}
          className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Régénérer
        </button>
        <button
          onClick={() => onImprove?.(sectionKey, phaseKey)}
          className="flex items-center px-3 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Améliorer
        </button>
      </div>
    </div>
  );
};