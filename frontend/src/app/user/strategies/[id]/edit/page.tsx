'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  Building,
  Clock,
} from 'lucide-react';
import { useStrategy, useStrategies } from '@/src/hooks/useStrategies';
import StrategyForm from '@/src/components/strategy/StrategyForm';
import { BusinessInfo } from '@/src/types/strategy.types';

// Composant de chargement
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        
        {/* Form skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
            <div className="pt-6">
              <div className="h-12 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function EditStrategyPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;
  
  const { strategy, isLoading: isLoadingStrategy, error } = useStrategy(strategyId);
  const { updateStrategy } = useStrategies();

  // Rediriger si pas d'ID
  useEffect(() => {
    if (!strategyId) {
      router.replace('/user/strategies');
    }
  }, [strategyId, router]);

  const handleSubmit = async (data: BusinessInfo) => {
    try {
      await updateStrategy(strategyId, data);
      toast.success('Stratégie mise à jour avec succès !');
      router.push(`/user/strategies/${strategyId}`);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la stratégie');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoadingStrategy) {
    return <LoadingSkeleton />;
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Stratégie introuvable
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Cette stratégie n\'existe pas ou a été supprimée.'}
            </p>
            <Link
              href="/user/strategies"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux stratégies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/user/strategies" className="hover:text-gray-700 transition-colors">
            Stratégies
          </Link>
          <span>•</span>
          <Link 
            href={`/user/strategies/${strategy._id}`} 
            className="hover:text-gray-700 transition-colors truncate max-w-64"
          >
            {strategy.businessInfo.businessName}
          </Link>
          <span>•</span>
          <span className="text-gray-900 font-medium">Modifier</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Modifier la stratégie
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {strategy.businessInfo.businessName} • {strategy.businessInfo.industry}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Créée le {formatDate(strategy.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/user/strategies/${strategy._id}`}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Link>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Informations Business
            </h2>
            <p className="text-gray-600">
              Modifiez les informations de votre entreprise. Les sections de stratégie seront automatiquement régénérées si nécessaire.
            </p>
          </div>

          <StrategyForm
            onSubmit={handleSubmit}
            defaultValues={strategy.businessInfo}
            isEditing={true}
            submitButtonText="Mettre à jour la stratégie"
            submitButtonIcon={Save}
          />
        </div>

        {/* Avertissement */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-amber-900 font-semibold mb-2">
                Important à savoir
              </h3>
              <div className="text-amber-800 text-sm space-y-2">
                <p>
                  • La modification des informations business peut nécessiter la régénération de certaines sections de votre stratégie.
                </p>
                <p>
                  • Les sections régénérées remplaceront le contenu existant.
                </p>
                <p>
                  • Vous pourrez toujours régénérer individuellement chaque section depuis la page de détails.
                </p>
                <p>
                  • L'historique des versions précédentes ne sera pas conservé.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} manually
