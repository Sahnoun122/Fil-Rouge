'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
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
  const { updateStrategy, isLoading: isUpdating } = useStrategies();

  // Rediriger si pas d'ID
  useEffect(() => {
    if (!strategyId) {
      router.replace('/user/strategies');
    }
  }, [strategyId, router]);

  const handleSubmit = async (data: BusinessInfo) => {
    try {
      await updateStrategy(strategyId, data);
      toast.success('Strategy updated successfully!');
      router.push(`/user/strategies/${strategyId}`);
    } catch (error: any) {
      console.error('Error updating strategy:', error);
      toast.error(error.message || 'Error updating strategy');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
              Strategy not found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'This strategy does not exist or has been deleted.'}
            </p>
            <Link
              href="/user/strategies"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to strategies
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
            Strategies
          </Link>
          <span>•</span>
          <Link 
            href={`/user/strategies/${strategy._id}`} 
            className="hover:text-gray-700 transition-colors truncate max-w-64"
          >
            {strategy.businessInfo.businessName}
          </Link>
          <span>•</span>
          <span className="text-gray-900 font-medium">Edit</span>
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
                    Edit Strategy
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {strategy.businessInfo.businessName} • {strategy.businessInfo.industry}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Created on {formatDate(strategy.createdAt)}
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
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Business Information
            </h2>
            <p className="text-gray-600">
              Update your business details. Strategy sections will be automatically regenerated if needed.
            </p>
          </div>

          <StrategyForm
            onSubmit={handleSubmit}
            initialData={strategy.businessInfo}
            isLoading={isUpdating}
          />
        </div>

        {/* Avertissement */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-amber-900 font-semibold mb-2">
                Important to know
              </h3>
              <div className="text-amber-800 text-sm space-y-2">
                <p>
                  • Modifying business information may require regeneration of some strategy sections.
                </p>
                <p>
                  • Regenerated sections will replace the existing content.
                </p>
                <p>
                  • You can always regenerate each section individually from the details page.
                </p>
                <p>
                  • The history of previous versions will not be retained.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
