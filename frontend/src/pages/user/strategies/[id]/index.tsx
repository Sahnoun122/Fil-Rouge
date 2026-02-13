'use client';

// pages/user/strategies/[id].tsx - Vue détaillée de la stratégie

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '../../../../components/layout/UserLayout';
import { StrategyTabs } from '../../../../components/strategy/StrategyTabs';
import { RegenerateModal } from '../../../../components/strategy/RegenerateModal';
import { SimpleToast } from '../../../../components/ui/SimpleToast';
import { MarketingStrategy, StrategySection, TabKey } from '../../../../types/strategy';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  TrendingUp, 
  Target, 
  Users, 
  Sparkles,
  Copy,
  Mail,
  MessageCircle
} from 'lucide-react';

export default function StrategyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerateSection, setRegenerateSection] = useState<{sectionKey: string, phaseKey: TabKey, instruction: string} | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const loadStrategy = () => {
      try {
        const saved = localStorage.getItem('user_strategies');
        if (saved) {
          const strategies = JSON.parse(saved);
          const foundStrategy = strategies.find((s: MarketingStrategy) => s.id === id);
          if (foundStrategy) {
            setStrategy(foundStrategy);
          } else {
            router.push('/user/strategies');
          }
        } else {
          router.push('/user/strategies');
        }
      } catch (error) {
        console.error('Error loading strategy:', error);
        router.push('/user/strategies');
      }
      setLoading(false);
    };

    loadStrategy();
  }, [id, router]);

  const goBack = () => {
    router.push('/user/strategies');
  };

  const handleRegenerateSection = (sectionKey: string, phaseKey: TabKey, instruction: string) => {
    setRegenerateSection({ sectionKey, phaseKey, instruction });
    setIsRegenerateModalOpen(true);
  };

  const handleRegenerateConfirm = async (instruction: string) => {
    if (!regenerateSection || !strategy) return;

    setIsRegenerateModalOpen(false);
    
    // Simulation de régénération
    setToast({ type: 'info', message: 'Régénération en cours...' });
    
    try {
      // Attendre un peu pour simuler l'IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mettre à jour la section
      const updatedStrategy = { ...strategy };
      const { sectionKey, phaseKey } = regenerateSection;
      
      if (phaseKey && sectionKey && updatedStrategy[phaseKey as keyof typeof updatedStrategy]) {
        const phaseData = updatedStrategy[phaseKey as keyof typeof updatedStrategy] as any;
        if (phaseData[sectionKey]) {
          phaseData[sectionKey] = {
            ...phaseData[sectionKey],
            content: phaseData[sectionKey].content + ' [Mise à jour par IA]',
            isGenerated: true
          };
        }
      }
      
      // Sauvegarder dans localStorage
      const saved = localStorage.getItem('user_strategies');
      if (saved) {
        const strategies = JSON.parse(saved);
        const updatedStrategies = strategies.map((s: MarketingStrategy) => 
          s.id === strategy.id ? updatedStrategy : s
        );
        localStorage.setItem('user_strategies', JSON.stringify(updatedStrategies));
      }
      
      setStrategy(updatedStrategy);
      setToast({ type: 'success', message: 'Section régénérée avec succès !' });
    } catch (error) {
      setToast({ type: 'error', message: 'Erreur lors de la régénération' });
    } finally {
      setRegenerateSection(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setToast({ type: 'info', message: 'Export en cours...' });
    
    try {
      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      setToast({ type: 'success', message: 'Stratégie exportée avec succès !' });
    } catch (error) {
      setToast({ type: 'error', message: 'Erreur lors de l\'export' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Stratégie Marketing - ${strategy?.businessForm.companyName}`,
        text: 'Découvrez ma stratégie marketing créée avec l\'IA',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToast({ type: 'success', message: 'Lien copié dans le presse-papier !' });
    }
  };

  if (loading) {
    return (
      <UserLayout title="Chargement...">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!strategy) {
    return (
      <UserLayout title="Introuvable">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Stratégie introuvable
          </h1>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
          >
            Retour à mes stratégies
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title={`Stratégie ${strategy.businessForm.companyName}`}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à mes stratégies
          </button>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Strategy Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-violet-100 rounded-xl">
                    <Sparkles className="w-8 h-8 text-violet-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Stratégie Marketing
                    </h1>
                    <h2 className="text-xl text-gray-700 font-medium mb-1">
                      {strategy.businessForm.companyName}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        Créée le {new Date(strategy.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-violet-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secteur</p>
                      <p className="text-sm text-gray-600">{strategy.businessForm.industry}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Objectif</p>
                      <p className="text-sm text-gray-600">{strategy.businessForm.objective}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ton</p>
                      <p className="text-sm text-gray-600">{strategy.businessForm.tone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="inline-flex items-center justify-center px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Export...' : 'Exporter PDF'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setToast({ type: 'success', message: 'Lien copié !' });
                    }}
                    className="inline-flex items-center justify-center p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`mailto:?subject=Ma stratégie marketing&body=Découvrez ma stratégie : ${window.location.href}`)}
                    className="inline-flex items-center justify-center p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Content */}
        <StrategyTabs 
          strategy={strategy} 
          onRegenerateSection={handleRegenerateSection}
        />

        {/* Regenerate Modal */}
        <RegenerateModal
          isOpen={isRegenerateModalOpen}
          onClose={() => setIsRegenerateModalOpen(false)}
          onSubmit={handleRegenerateConfirm}
          sectionTitle={regenerateSection?.sectionKey || ''}
          actionType="regenerate"
          isLoading={false}
        />

        {/* Toast */}
        {toast && (
          <SimpleToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </UserLayout>
  );
}