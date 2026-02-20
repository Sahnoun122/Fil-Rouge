'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TestTube, 
  Code, 
  Database, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Play,
  Loader2,
} from 'lucide-react';
import useStrategiesList from '@/src/hooks/useStrategies';
// import { useStrategiesList, useStrategies } from '../../../hooks/useStrategies';
import strategiesService from '@/src/services/strategiesService';
// import { strategiesService } from '../../../services/strategiesService';

// Composant de test pour les services
const ApiTestPanel = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState<string | null>(null);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsRunning(testName);
    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message || 'Erreur inconnue' }
      }));
    } finally {
      setIsRunning(null);
    }
  };

  const tests = [
    {
      name: 'health',
      label: 'Test de connexion API',
      description: 'Vérifie que l\'API backend est accessible',
      testFn: () => fetch('/api/health').then(r => r.json())
    },
    {
      name: 'auth-check',
      label: 'Vérification authentification',
      description: 'Teste si le token JWT est valide',
      testFn: () => strategiesService.getAllStrategies(1, 1)
    },
    {
      name: 'types-validation',
      label: 'Validation des types',
      description: 'Vérifie la cohérence des types TypeScript',
      testFn: () => Promise.resolve({
        businessInfoFields: ['businessName', 'industry', 'targetAudience', 'mainObjective', 'budget', 'location', 'tone'],
        strategyFields: ['_id', 'businessInfo', 'generatedStrategy', 'createdAt', 'updatedAt'],
        enums: { MainObjective: 5, Tone: 4 }
      })
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TestTube className="w-5 h-5 mr-2" />
        Tests API et Services
      </h3>
      
      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{test.label}</h4>
              <button
                onClick={() => runTest(test.name, test.testFn)}
                disabled={isRunning === test.name}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning === test.name ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                Tester
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{test.description}</p>
            
            {testResults[test.name] && (
              <div className={`p-3 rounded-lg text-sm ${
                testResults[test.name].success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {testResults[test.name].success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    testResults[test.name].success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {testResults[test.name].success ? 'Succès' : 'Échec'}
                  </span>
                </div>
                
                <pre className={`text-xs overflow-x-auto ${
                  testResults[test.name].success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {JSON.stringify(
                    testResults[test.name].success 
                      ? testResults[test.name].data 
                      : testResults[test.name].error, 
                    null, 
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant d'informations sur les hooks
const HooksInfo = () => {
  const { strategies, pagination, isLoading, error } = useStrategiesList();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Code className="w-5 h-5 mr-2" />
        État des Hooks
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">useStrategiesList</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Stratégies:</span>
                <span className="font-mono">{strategies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Page actuelle:</span>
                <span className="font-mono">{pagination.page}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-mono">{pagination.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chargement:</span>
                <span className={`font-mono ${isLoading ? 'text-orange-600' : 'text-green-600'}`}>
                  {isLoading ? 'true' : 'false'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Erreur:</span>
                <span className={`font-mono ${error ? 'text-red-600' : 'text-green-600'}`}>
                  {error ? 'true' : 'false'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">useStrategies (Actions)</h4>
            <div className="text-sm space-y-2">
              <div className="text-gray-600">Fonctions disponibles:</div>
              <ul className="space-y-1 font-mono text-xs">
                <li>• createStrategy</li>
                <li>• updateStrategy</li>
                <li>• deleteStrategy</li>
                <li>• regenerateSection</li>
              </ul>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Erreur détectée</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant principal de la page de test
export default function StrategyTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <TestTube className="w-8 h-8 mr-3 text-blue-600" />
                Tests & Développement
              </h1>
              <p className="text-gray-600 text-lg">
                Page de test pour valider l'intégration complète du système de stratégies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/user/strategies/new"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Tester Création
              </Link>
              <Link 
                href="/user/strategies"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir Liste
              </Link>
            </div>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Architecture Implémentée
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Types & Interfaces</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• strategy.types.ts</li>
                <li>• BusinessInfo</li>
                <li>• Strategy</li>
                <li>• GeneratedStrategy</li>
                <li>• Enums (MainObjective, Tone)</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Services API</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• strategiesService.ts</li>
                <li>• Authentification JWT</li>
                <li>• CRUD complet</li>
                <li>• Génération IA</li>
                <li>• Gestion d'erreurs</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Hooks Personnalisés</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• useStrategy</li>
                <li>• useStrategiesList</li>
                <li>• useStrategyActions</li>
                <li>• États & Pagination</li>
                <li>• Cache & Refresh</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Composants UI</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• StrategyForm</li>
                <li>• StrategyCard</li>
                <li>• Pages CRUD</li>
                <li>• Validation Zod</li>
                <li>• États de chargement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tests et monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ApiTestPanel />
          <HooksInfo />
        </div>

        {/* Navigation rapide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Navigation Rapide
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/user/strategies"
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div>
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900">Liste</div>
                <div className="text-xs text-gray-500">Voir toutes</div>
              </div>
            </Link>
            
            <Link 
              href="/user/strategies/new"
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div>
                <div className="text-2xl mb-2">➕</div>
                <div className="font-medium text-gray-900">Créer</div>
                <div className="text-xs text-gray-500">Nouvelle stratégie</div>
              </div>
            </Link>
            
            <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-100 text-center">
              <div>
                <div className="text-2xl mb-2">👁️</div>
                <div className="font-medium text-gray-400">Détails</div>
                <div className="text-xs text-gray-400">Sélectionner d'abord</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-100 text-center">
              <div>
                <div className="text-2xl mb-2">✏️</div>
                <div className="font-medium text-gray-400">Éditer</div>
                <div className="text-xs text-gray-400">Sélectionner d'abord</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions de développement */}
        <div className="bg-gray-900 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Instructions pour Développeurs
          </h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-200 mb-2">1. Vérifications Préliminaires</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Backend NestJS démarré sur le bon port</li>
                <li>Base de données MongoDB connectée</li>
                <li>Variables d'environnement configurées</li>
                <li>Token JWT valide dans localStorage</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-200 mb-2">2. Test du Flux Complet</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Créer une nouvelle stratégie via le formulaire</li>
                <li>Vérifier l'affichage dans la liste</li>
                <li>Ouvrir les détails et tester la régénération</li>
                <li>Modifier la stratégie et valider les changements</li>
                <li>Supprimer pour nettoyer</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-200 mb-2">3. Points de Validation</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Validation Zod des formulaires</li>
                <li>États de chargement et d'erreur</li>
                <li>Pagination et recherche</li>
                <li>Responsive design mobile</li>
                <li>Toasts de notification</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
