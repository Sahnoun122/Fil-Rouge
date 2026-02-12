'use client';

import React, { useState } from 'react';
import { MarketingStrategy, TabKey } from '@/types/strategy';
import { SectionCard } from './SectionCard';
import { RegenerateModal } from './RegenerateModal';
import { CheckCircle, Users, Target, Heart } from 'lucide-react';

interface StrategyTabsProps {
  strategy: MarketingStrategy;
  onRegenerateSection?: (sectionKey: string, phaseKey: TabKey, instruction: string) => void;
  onImproveSection?: (sectionKey: string, phaseKey: TabKey, instruction: string) => void;
  onEditSection?: (sectionKey: string, phaseKey: TabKey) => void;
}

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const tabs: TabConfig[] = [
  {
    key: 'avant',
    label: 'Avant',
    icon: Users,
    color: 'bg-blue-500',
    description: 'Comprendre et attirer vos prospects'
  },
  {
    key: 'pendant',
    label: 'Pendant',
    icon: Target,
    color: 'bg-violet-500',
    description: 'Convertir vos prospects en clients'
  },
  {
    key: 'apres',
    label: 'Après',
    icon: Heart,
    color: 'bg-pink-500',
    description: 'Fidéliser et développer vos clients'
  }
];

export const StrategyTabs: React.FC<StrategyTabsProps> = ({
  strategy,
  onRegenerateSection,
  onImproveSection,
  onEditSection
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('avant');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    sectionKey: string;
    phaseKey: TabKey;
    actionType: 'regenerate' | 'improve';
    sectionTitle: string;
  }>({
    isOpen: false,
    sectionKey: '',
    phaseKey: 'avant',
    actionType: 'regenerate',
    sectionTitle: ''
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = (sectionKey: string, phaseKey: TabKey) => {
    setModalState({
      isOpen: true,
      sectionKey,
      phaseKey,
      actionType: 'regenerate',
      sectionTitle: getSectionTitle(sectionKey)
    });
  };

  const handleImprove = (sectionKey: string, phaseKey: TabKey) => {
    setModalState({
      isOpen: true,
      sectionKey,
      phaseKey,
      actionType: 'improve',
      sectionTitle: getSectionTitle(sectionKey)
    });
  };

  const handleEdit = (sectionKey: string, phaseKey: TabKey) => {
    onEditSection?.(sectionKey, phaseKey);
  };

  const handleModalSubmit = async (instruction: string) => {
    setIsRegenerating(true);
    try {
      if (modalState.actionType === 'regenerate') {
        await onRegenerateSection?.(modalState.sectionKey, modalState.phaseKey, instruction);
      } else {
        await onImproveSection?.(modalState.sectionKey, modalState.phaseKey, instruction);
      }
    } finally {
      setIsRegenerating(false);
      setModalState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const getSectionTitle = (sectionKey: string) => {
    const titles: Record<string, string> = {
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
    return titles[sectionKey] || sectionKey;
  };

  const renderTabContent = () => {
    const phase = strategy[activeTab];
    if (!phase) return null;

    let sections: Array<{ key: string; data: any }> = [];

    switch (activeTab) {
      case 'avant':
        sections = [
          { key: 'marcheTarget', data: phase.marcheTarget },
          { key: 'messageMarketing', data: phase.messageMarketing },
          { key: 'canauxCommunication', data: phase.canauxCommunication }
        ];
        break;
      case 'pendant':
        sections = [
          { key: 'captureProspects', data: phase.captureProspects },
          { key: 'nurturing', data: phase.nurturing },
          { key: 'conversion', data: phase.conversion }
        ];
        break;
      case 'apres':
        sections = [
          { key: 'experienceClient', data: phase.experienceClient },
          { key: 'augmentationValeurClient', data: phase.augmentationValeurClient },
          { key: 'recommandation', data: phase.recommandation }
        ];
        break;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(section => (
          <SectionCard
            key={section.key}
            sectionKey={section.key}
            data={section.data}
            phaseKey={activeTab}
            onRegenerate={handleRegenerate}
            onImprove={handleImprove}
            onEdit={handleEdit}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 transition-colors ${
                  isActive 
                    ? tab.color + ' text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
                {isActive && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Phase Description */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center">
          {(() => {
            const currentTab = tabs.find(tab => tab.key === activeTab);
            if (!currentTab) return null;
            const Icon = currentTab.icon;
            
            return (
              <>
                <div className={`${currentTab.color} p-3 rounded-xl mr-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Phase {currentTab.label.toUpperCase()}
                  </h2>
                  <p className="text-gray-600">{currentTab.description}</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Regenerate Modal */}
      <RegenerateModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleModalSubmit}
        sectionTitle={modalState.sectionTitle}
        actionType={modalState.actionType}
        isLoading={isRegenerating}
      />
    </div>
  );
};