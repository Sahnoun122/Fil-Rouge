'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sparkles, AlertCircle } from 'lucide-react';
import StrategyForm from '@/src/components/strategy/StrategyForm';
import { useStrategiesList } from '@/src/hooks/useStrategies';
import { GenerateStrategyDto } from '@/src/types/strategy.types';

export default function NewStrategyPage() {
  const router = useRouter();
  const { generateStrategy, isGenerating, error } = useStrategiesList();

  const handleFormSubmit = async (data: GenerateStrategyDto) => {
    try {
      const newStrategy = await generateStrategy(data);
      
      // Afficher un message de succès
      toast.success('Stratégie générée avec succès !', {
        duration: 4000,
        position: 'top-right',
      });
      
      // Rediriger vers la stratégie généré
      router.push(`/strategies/${newStrategy._id}`);
    } catch (error) {
      // Afficher un message d'erreur
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération';
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créer une Stratégie Marketing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Générez une stratégie marketing complète et personnalisée avec l'intelligence artificielle.
            Remplissez le formulaire ci-dessous pour commencer.
          </p>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900">Erreur de génération</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de stratégie */}
        <StrategyForm 
          onSubmit={handleFormSubmit}
          isLoading={isGenerating}
          className="mb-16"
        />

        {/* Section informative */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ce que vous allez obtenir
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Phase Avant */}
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    AVANT
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Phase d'Acquisition
                </h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Analyse du marché cible</li>
                  <li>• Message marketing personnalisé</li>
                  <li>• Stratégie de canaux de communication</li>
                </ul>
              </div>

              {/* Phase Pendant */}
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    PENDANT
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Phase de Conversion
                </h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Stratégie de capture de prospects</li>
                  <li>• Séquences de nurturing</li>
                  <li>• Optimisation de la conversion</li>
                </ul>
              </div>

              {/* Phase Après */}
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    APRÈS
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Phase de Fidélisation
                </h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Amélioration de l'expérience client</li>
                  <li>• Stratégies d'upsell/cross-sell</li>
                  <li>• Système de recommandation</li>
                </ul>
              </div>
              
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">30+</div>
              <p className="text-gray-600">Points d'analyse détaillés</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3</div>
              <p className="text-gray-600">Phases stratégiques complètes</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <p className="text-gray-600">Personnalisé pour votre business</p>
            </div>
          </div>

          {/* Call to action additionnel */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🚀 Prêt à transformer votre marketing ?
              </h3>
              <p className="text-gray-600">
                Remplissez le formulaire ci-dessus et obtenez votre stratégie complète en moins de 2 minutes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
