'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StrategyTabs } from '@/components/strategy/StrategyTabs';
import { LoadingSkeleton } from '@/components/strategy/LoadingSkeleton';
import { MarketingStrategy, TabKey } from '@/types/strategy';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit3, 
  Calendar,
  Building2,
  Target,
  MapPin,
  DollarSign,
  Palette,
  Sparkles
} from 'lucide-react';

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStrategy = async () => {
      try {
        const strategyId = params.id as string;
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load from localStorage (in real app, this would be an API call)
        const savedStrategy = localStorage.getItem(`strategy-${strategyId}`);
        
        if (!savedStrategy) {
          setError('Stratégie non trouvée');
          return;
        }
        
        const parsedStrategy = JSON.parse(savedStrategy);
        setStrategy(parsedStrategy);
      } catch (err) {
        setError('Erreur lors du chargement de la stratégie');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadStrategy();
    }
  }, [params.id]);

  const handleRegenerateSection = async (sectionKey: string, phaseKey: TabKey, instruction: string) => {
    if (!strategy) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock regeneration - in real app, call AI API
    console.log(`Regenerating ${phaseKey}.${sectionKey} with instruction: ${instruction}`);
    
    // For demo, just add a timestamp to show it updated
    const updatedStrategy = {
      ...strategy,
      [phaseKey]: {
        ...strategy[phaseKey],
        [sectionKey]: {
          ...strategy[phaseKey][sectionKey],
          _lastUpdated: new Date().toLocaleString()
        }
      }
    };
    
    setStrategy(updatedStrategy);
    localStorage.setItem(`strategy-${strategy.id}`, JSON.stringify(updatedStrategy));
  };

  const handleImproveSection = async (sectionKey: string, phaseKey: TabKey, instruction: string) => {
    if (!strategy) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock improvement - in real app, call AI API
    console.log(`Improving ${phaseKey}.${sectionKey} with instruction: ${instruction}`);
    
    // For demo, just add improvement marker
    const updatedStrategy = {
      ...strategy,
      [phaseKey]: {
        ...strategy[phaseKey],
        [sectionKey]: {
          ...strategy[phaseKey][sectionKey],
          _improved: true,
          _lastImproved: new Date().toLocaleString()
        }
      }
    };
    
    setStrategy(updatedStrategy);
    localStorage.setItem(`strategy-${strategy.id}`, JSON.stringify(updatedStrategy));
  };

  const handleEditSection = (sectionKey: string, phaseKey: TabKey) => {
    // In real app, open edit modal or navigate to edit page
    console.log(`Edit ${phaseKey}.${sectionKey}`);
    alert(`Édition de ${phaseKey}.${sectionKey} - Fonctionnalité à implémenter`);
  };

  const handleExport = () => {
    if (!strategy) return;
    
    const exportData = {
      ...strategy,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategie-${strategy.businessForm.businessName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Stratégie Marketing - ${strategy?.businessForm.businessName}`,
          text: 'Découvrez ma stratégie marketing générée par MarketPlan IA',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="strategy" />
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Stratégie introuvable'}
          </h1>
          <p className="text-gray-600 mb-6">
            La stratégie que vous cherchez n&apos;existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push('/strategies/create')}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-colors font-medium"
          >
            Créer une nouvelle stratégie
          </button>
        </div>
      </div>
    );
  }

  const objectiveLabels = {
    leads: 'Générer des prospects',
    sales: 'Augmenter les ventes',
    awareness: 'Améliorer la notoriété',
    engagement: 'Engager la communauté'
  };

  const toneLabels = {
    friendly: 'Amical',
    professional: 'Professionnel',
    luxury: 'Luxueux',
    young: 'Jeune'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {strategy.businessForm.businessName}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Créé le {new Date(strategy.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
                <button
                  onClick={() => router.push('/strategies/create')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Nouvelle stratégie
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Secteur</span>
                </div>
                <p className="text-blue-800 font-semibold">{strategy.businessForm.industry}</p>
              </div>
              
              <div className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5 text-violet-600 mr-2" />
                  <span className="text-sm font-medium text-violet-900">Objectif</span>
                </div>
                <p className="text-violet-800 font-semibold">
                  {objectiveLabels[strategy.businessForm.mainObjective]}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Zone</span>
                </div>
                <p className="text-green-800 font-semibold">{strategy.businessForm.location}</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Palette className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-900">Ton</span>
                </div>
                <p className="text-purple-800 font-semibold">
                  {toneLabels[strategy.businessForm.tone]}
                </p>
              </div>
              
              {strategy.businessForm.budget && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-900">Budget</span>
                  </div>
                  <p className="text-orange-800 font-semibold">
                    {strategy.businessForm.budget.toLocaleString('fr-FR')}€/mois
                  </p>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Edit3 className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Actions</span>
                </div>
                <button className="text-gray-800 font-semibold hover:text-gray-600 transition-colors">
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StrategyTabs
          strategy={strategy}
          onRegenerateSection={handleRegenerateSection}
          onImproveSection={handleImproveSection}
          onEditSection={handleEditSection}
        />
      </div>
    </div>
  );
}