import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Sparkles, AlertCircle, Target, CheckCircle } from 'lucide-react';
import StrategyForm, { StrategyFormData } from '../../components/user/StrategyForm';

export default function CreateStrategyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: StrategyFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/strategies/generate-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate strategy');
      }

      const result = await response.json();
      router.push(`/strategies/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Marketing Strategy
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill out the form below to generate a comprehensive marketing strategy powered by AI
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Strategy Form */}
        <StrategyForm onSubmit={onSubmit} isLoading={isLoading} />

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
                <Target className="w-8 h-8 text-white" />
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
                <CheckCircle className="w-8 h-8 text-white" />
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