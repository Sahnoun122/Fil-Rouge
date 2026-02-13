'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StrategyForm } from '../../../components/strategy/StrategyForm';
import { LoadingSkeleton } from '../../../components/strategy/LoadingSkeleton';
import { BusinessForm, GenerationState } from '../../../types/strategy';
import { CheckCircle, Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function CreateStrategyPage() {
  const router = useRouter();
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: [],
    currentPhase: '',
    currentSection: ''
  });

  const generateMockStrategy = async (formData: BusinessForm): Promise<string> => {
    const steps = [
      { phase: 'Avant', section: 'Analyse du marché cible', duration: 2000 },
      { phase: 'Avant', section: 'Définition du message marketing', duration: 1500 },
      { phase: 'Avant', section: 'Sélection des canaux de communication', duration: 1800 },
      { phase: 'Pendant', section: 'Stratégie de capture de prospects', duration: 2200 },
      { phase: 'Pendant', section: 'Séquences de nurturing', duration: 1700 },
      { phase: 'Pendant', section: 'Optimisation de la conversion', duration: 1900 },
      { phase: 'Après', section: 'Amélioration de l&apos;expérience client', duration: 1600 },
      { phase: 'Après', section: 'Stratégies d&apos;augmentation de valeur', duration: 1400 },
      { phase: 'Après', section: 'Système de recommandation', duration: 1300 }
    ];

    const progress = steps.map((step, index) => ({
      phase: step.phase,
      section: step.section,
      isComplete: false
    }));

    setGenerationState({
      isGenerating: true,
      progress,
      currentPhase: steps[0].phase,
      currentSection: steps[0].section
    });

    for (const [index, step] of steps.entries()) {
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      setGenerationState(prev => ({
        ...prev,
        currentPhase: step.phase,
        currentSection: step.section,
        progress: prev.progress.map((p, i) => ({
          ...p,
          isComplete: i <= index
        }))
      }));
    }

    // Simulate final processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a unique strategy ID
    const strategyId = `strategy-${Date.now()}`;
    
    // Store the form data in localStorage (for demo purposes)
    const mockStrategy = {
      id: strategyId,
      businessForm: formData,
      createdAt: new Date(),
      avant: {
        marcheTarget: {
          persona: `Professionnels ${formData.targetAudience} travaillant dans le secteur ${formData.industry}`,
          besoins: [
            'Solutions digitales efficaces',
            'Gain de temps et productivité',
            'Amélioration des processus métier'
          ],
          problemes: [
            'Processus manuels chronophages',
            'Manque de visibilité sur les performances',
            'Difficultés de collaboration'
          ],
          comportementDigital: [
            'Utilise LinkedIn professionnellement',
            'Recherche d&apos;informations sur Google',
            'Consomme du contenu éducatif'
          ]
        },
        messageMarketing: {
          propositionValeur: `${formData.productOrService} - La solution qui révolutionne votre ${formData.industry.toLowerCase()}`,
          messagePrincipal: `Transformez votre façon de travailler avec notre solution innovante dédiée au ${formData.industry.toLowerCase()}`,
          tonCommunication: formData.tone
        },
        canauxCommunication: {
          plateformes: [
            {
              platform: 'LinkedIn',
              typesContenu: ['Articles professionnels', 'Études de cas', 'Posts éducatifs']
            },
            {
              platform: 'Google Ads',
              typesContenu: ['Annonces search', 'Display ciblé', 'Remarketing']
            },
            {
              platform: 'Email Marketing',
              typesContenu: ['Newsletter', 'Séquences automatisées', 'Contenus exclusifs']
            }
          ]
        }
      },
      pendant: {
        captureProspects: {
          landingPage: 'Page dédiée avec proposition de valeur claire et formulaire optimisé',
          formulaire: ['Nom', 'Email', 'Entreprise', 'Fonction'],
          offreIncitative: 'Livre blanc: "Guide complet pour optimiser votre ' + formData.industry.toLowerCase() + '"'
        },
        nurturing: {
          sequenceEmails: [
            'Email de bienvenue avec le livre blanc',
            'Étude de cas client similaire',
            'Démonstration produit personnalisée',
            'Témoignages et preuves sociales'
          ],
          contenusEducatifs: [
            'Webinaires gratuits',
            'Templates et outils',
            'Articles de blog spécialisés'
          ],
          relances: [
            'SMS personnalisé après 3 jours',
            'Appel commercial après 1 semaine',
            'Email avec offre limitée'
          ]
        },
        conversion: {
          cta: ['Demander une démo', 'Essai gratuit 30 jours', 'Parler à un expert'],
          offres: [
            'Réduction first-time buyer',
            'Onboarding gratuit',
            'Support prioritaire 3 mois'
          ],
          argumentaireVente: 'ROI démontré de 300% en 6 mois avec nos clients similaires'
        }
      },
      apres: {
        experienceClient: {
          recommendations: [
            'Onboarding personnalisé avec success manager',
            'Formation complète de l&apos;équipe',
            'Support technique réactif 24/7',
            'Suivi régulier des performances'
          ]
        },
        augmentationValeurClient: {
          upsell: [
            'Modules complémentaires',
            'Augmentation du nombre d&apos;utilisateurs',
            'Fonctionnalités premium'
          ],
          crossSell: [
            'Services de consulting',
            'Formation avancée',
            'Intégrations tierces'
          ],
          fidelite: [
            'Programme de fidélité avec points',
            'Réductions sur renouvellement',
            'Accès exclusif aux nouvelles fonctionnalités'
          ]
        },
        recommandation: {
          parrainage: [
            'Réduction de 20% pour chaque référence',
            'Programme ambassadeur',
            'Commissions récurrentes'
          ],
          avisClients: [
            'Sollicitation automatique post-succès',
            'Incentives pour avis détaillés',
            'Showcase sur le site web'
          ],
          recompenses: [
            'Cadeaux d&apos;entreprise personnalisés',
            'Accès VIP aux événements',
            'Reconnaissance publique'
          ]
        }
      }
    };

    localStorage.setItem(`strategy-${strategyId}`, JSON.stringify(mockStrategy));
    
    setGenerationState(prev => ({ ...prev, isGenerating: false }));
    
    return strategyId;
  };

  const handleFormSubmit = async (formData: BusinessForm) => {
    try {
      const strategyId = await generateMockStrategy(formData);
      router.push(`/strategies/${strategyId}`);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      setGenerationState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  if (generationState.isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header avec animation */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 rounded-3xl animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Création de votre stratégie en cours...
            </h1>
            <p className="text-xl text-gray-600">
              Notre IA génère votre One Page Marketing Plan personnalisé
            </p>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {generationState.currentPhase} - {generationState.currentSection}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Temps estimé restant: 
                  {generationState.progress.filter(p => !p.isComplete).length * 2} secondes
                </p>
              </div>
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 rounded-2xl animate-spin">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              {generationState.progress.map((step, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    step.isComplete 
                      ? 'bg-green-500' 
                      : generationState.currentSection === step.section
                        ? 'bg-violet-500 animate-pulse'
                        : 'bg-gray-200'
                  }`}>
                    {step.isComplete ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : generationState.currentSection === step.section ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        step.isComplete 
                          ? 'text-green-700' 
                          : generationState.currentSection === step.section
                            ? 'text-violet-700'
                            : 'text-gray-500'
                      }`}>
                        {step.phase}: {step.section}
                      </span>
                      {step.isComplete && (
                        <span className="text-green-600 font-medium">Terminé</span>
                      )}
                      {generationState.currentSection === step.section && (
                        <span className="text-violet-600 font-medium flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600 mr-2"></div>
                          En cours...
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          step.isComplete 
                            ? 'bg-green-500 w-full' 
                            : generationState.currentSection === step.section
                              ? 'bg-violet-500 w-3/4 animate-pulse'
                              : 'bg-gray-200 w-0'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Stratégie Complète</h3>
              <p className="text-gray-600 text-sm">
                Nous analysons plus de 50 points de données pour créer votre plan marketing
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="bg-violet-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">IA Avancée</h3>
              <p className="text-gray-600 text-sm">
                Notre intelligence artificielle s&apos;appuie sur des milliers de stratégies gagnantes
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Résultats Prouvés</h3>
              <p className="text-gray-600 text-sm">
                Les entreprises utilisant nos stratégies voient +150% de croissance moyenne
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MarketPlan IA
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Générez une stratégie marketing complète et personnalisée en quelques minutes grâce à l&apos;intelligence artificielle
          </p>
        </div>

        <StrategyForm onSubmit={handleFormSubmit} isLoading={generationState.isGenerating} />

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">IA Personnalisée</h3>
            <p className="text-gray-600">
              Notre IA analyse votre secteur et vos objectifs pour créer une stratégie sur mesure
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Plan Complet</h3>
            <p className="text-gray-600">
              De l&apos;acquisition à la fidélisation, obtenez une stratégie complète en 3 phases
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Action Immédiate</h3>
            <p className="text-gray-600">
              Recevez des recommandations concrètes et actionnables pour votre entreprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}