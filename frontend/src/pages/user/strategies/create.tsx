'use client';

// pages/user/strategies/create.tsx - Création de stratégie pour utilisateur

import { useState } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '../../../components/layout/UserLayout';
import { StrategyForm } from '../../../components/strategy/StrategyForm';
import { LoadingSkeleton } from '../../../components/strategy/LoadingSkeleton';
import { BusinessForm, MarketingStrategy } from '../../../types/strategy';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CreateStrategyPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const generateMockStrategy = (businessForm: BusinessForm): MarketingStrategy => {
    const mockStrategy: MarketingStrategy = {
      id: Date.now().toString(),
      businessForm,
      status: 'completed',
      createdAt: new Date().toISOString(),
      avant: {
        analyseBusiness: {
          title: "Analyse Business",
          content: `Votre entreprise ${businessForm.companyName} évolue dans le secteur ${businessForm.industry}. Avec un objectif de ${businessForm.objective}, nous identifions plusieurs opportunités de croissance. L'analyse révèle une position concurrentielle intéressante avec des atouts différenciants à valoriser.`,
          isGenerated: true
        },
        analysePublic: {
          title: "Analyse du Public",
          content: `Votre cible principale se compose de [persona détaillé]. Ces clients potentiels sont motivés par [besoins spécifiques] et présentent des comportements d'achat caractérisés par [patterns d'achat]. L'analyse démographique et psychographique révèle des opportunités d'engagement précises.`,
          isGenerated: true
        },
        analyseConcurrence: {
          title: "Analyse Concurrentielle",
          content: `Le paysage concurrentiel dans ${businessForm.industry} présente [X concurrents principaux]. Leurs stratégies se concentrent sur [axes principaux]. Votre avantage concurrentiel réside dans [différenciation unique]. Les gaps de marché identifiés offrent des opportunités de positionnement.`,
          isGenerated: true
        },
        analyseSwot: {
          title: "Analyse SWOT",
          content: `**Forces:** Expertise technique, relation client privilégiée, innovation produit. **Faiblesses:** Notoriété limitée, ressources marketing restreintes. **Opportunités:** Marché en croissance, digitalisation, nouvelles demandes. **Menaces:** Concurrence accrue, évolution réglementaire.`,
          isGenerated: true
        }
      },
      pendant: {
        strategyCreative: {
          title: "Stratégie Créative",
          content: `Développement d'une identité de marque ${businessForm.tone} qui résonne avec votre audience. La ligne créative s'articule autour de [concept central] avec des déclinaisons visuelles et narratives cohérentes. Chaque touchpoint client véhicule les valeurs fondamentales de votre marque.`,
          isGenerated: true
        },
        planMedia: {
          title: "Plan Media",
          content: `Stratégie multi-canal optimisée : 40% digital (SEO/SEA, social media), 30% content marketing, 20% relations presse, 10% événementiel. Budget alloué selon les performances et ROI potentiel. Planning échelonné sur 12 mois avec pics saisonniers.`,
          isGenerated: true
        },
        planContenu: {
          title: "Plan de Contenu",
          content: `Calendrier éditorial structuré : 3 posts/semaine sur réseaux sociaux, 1 article de blog/semaine, newsletter mensuelle, livres blancs trimestriels. Contenu éducatif (40%), promotionnel (30%), communautaire (30%). Ton ${businessForm.tone} adapté à chaque canal.`,
          isGenerated: true
        },
        kpiMetriques: {
          title: "KPI & Métriques",
          content: `Indicateurs de performance : Trafic web (+150%), leads qualifiés (+200%), taux de conversion (+50%), notoriété assistée (+300%), engagement social (+400%). Dashboard monthly de suivi avec alertes automatiques. ROI target : 300% sur 12 mois.`,
          isGenerated: true
        }
      },
      apres: {
        planSuivi: {
          title: "Plan de Suivi",
          content: `Monitoring hebdomadaire des KPIs principaux, reporting mensuel détaillé, revue trimestrielle de stratégie. Mise en place d'un tableau de bord temps réel via Google Analytics 4 et outils marketing automation. Points de contrôle à 3, 6 et 12 mois.`,
          isGenerated: true
        },
        optimisations: {
          title: "Optimisations",
          content: `Tests A/B continus sur landing pages et campagnes, optimisation SEO mensuelle, ajustements budgétaires selon performance. Amélioration de l'expérience utilisateur basée sur les données comportementales. Itérations rapides sur les contenus les plus performants.`,
          isGenerated: true
        },
        evolutionStrategy: {
          title: "Evolution Stratégie",
          content: `Roadmap d'évolution à 18 mois incluant de nouveaux canaux (TikTok, LinkedIn), programmes de fidélisation, expansion géographique. Innovation continue avec intelligence artificielle et personnalisation. Adaptation aux tendances marché et comportements consommateurs.`,
          isGenerated: true
        },
        reportingAnalyse: {
          title: "Reporting & Analyse",
          content: `Rapports automatisés mensuels avec insights actionnables. Attribution multi-touch pour comprendre le parcours client. Analyse prédictive pour anticiper les tendances. Recommandations stratégiques basées sur l'analyse des données et benchmarks sectoriels.`,
          isGenerated: true
        }
      }
    };

    return mockStrategy;
  };

  const handleFormSubmit = async (formData: BusinessForm) => {
    setIsGenerating(true);
    
    const steps = [
      'Analyse de votre entreprise...',
      'Étude du marché cible...',
      'Analyse de la concurrence...',
      'Création du profil client...',
      'Définition des objectifs...',
      'Élaboration de la stratégie créative...',
      'Planification des actions marketing...',
      'Calcul des KPIs et ROI...',
      'Finalisation de votre stratégie personnalisée...'
    ];

    // Simulation de génération IA
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Génération de la stratégie
    const newStrategy = generateMockStrategy(formData);
    
    // Sauvegarde dans localStorage
    try {
      const existingStrategies = JSON.parse(localStorage.getItem('user_strategies') || '[]');
      const updatedStrategies = [newStrategy, ...existingStrategies];
      localStorage.setItem('user_strategies', JSON.stringify(updatedStrategies));
      
      // Redirection vers la stratégie créée
      router.push(`/user/strategies/${newStrategy.id}`);
    } catch (error) {
      console.error('Error saving strategy:', error);
      setIsGenerating(false);
    }
  };

  const goBack = () => {
    router.push('/user/strategies');
  };

  if (isGenerating) {
    return (
      <UserLayout title="Génération...">
        <div className="p-6 max-w-4xl mx-auto">
          <LoadingSkeleton type="progress" currentStep={currentStep} />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Nouvelle Stratégie">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à mes stratégies
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-violet-100 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-violet-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créer une Nouvelle Stratégie
            </h1>
            
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Notre IA va analyser votre entreprise et créer une stratégie marketing 
              complète et personnalisée en quelques minutes.
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 mb-8 border">
          <h3 className="font-semibold text-gray-900 mb-4">
            Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-violet-600 text-white rounded-full font-bold text-sm mb-3">
                1
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Informations</h4>
              <p className="text-sm text-gray-600">
                Renseignez les détails de votre entreprise
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-violet-600 text-white rounded-full font-bold text-sm mb-3">
                2
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Analyse IA</h4>
              <p className="text-sm text-gray-600">
                Notre IA analyse votre marché et concurrence
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-violet-600 text-white rounded-full font-bold text-sm mb-3">
                3
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Stratégie</h4>
              <p className="text-sm text-gray-600">
                Recevez votre plan marketing personnalisé
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
          <StrategyForm onSubmit={handleFormSubmit} />
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">🎯 Analyse Précise</h4>
            <p className="text-gray-600 text-sm">
              Analyse approfondie de votre marché, concurrence et opportunités
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">📱 Multi-Canal</h4>
            <p className="text-gray-600 text-sm">
              Stratégie intégrée couvrant tous les canaux digitaux et traditionnels
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">📊 KPIs & ROI</h4>
            <p className="text-gray-600 text-sm">
              Métriques claires et objectifs mesurables pour votre succès
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-2">🔄 Évolutive</h4>
            <p className="text-gray-600 text-sm">
              Plan d'optimisation et d'évolution pour une performance continue
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}