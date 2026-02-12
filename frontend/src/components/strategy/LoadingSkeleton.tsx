import React from 'react';

interface LoadingSkeletonProps {
  type?: 'form' | 'strategy' | 'card' | 'progress';
  currentStep?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', currentStep }) => {
  if (type === 'form') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Form title skeleton */}
        <div className="h-8 bg-gray-200 rounded-lg w-2/3"></div>
        
        {/* Form fields skeletons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
        
        {/* Button skeleton */}
        <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
      </div>
    );
  }

  if (type === 'progress') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          {/* Progress Animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-violet-100"></div>
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                IA MarketPlan en action
              </h3>
              
              {currentStep && (
                <p className="text-violet-600 font-medium mb-4">
                  {currentStep}
                </p>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"></div>
                  <span>Analyse en cours...</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>Données</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"></div>
                    </div>
                    <span>Analyse</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span>Stratégie</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>⚡ Génération personnalisée en cours...</p>
            <p className="mt-1">Cela prend généralement 30-60 secondes</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'strategy') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg w-1/2"></div>
          <div className="flex space-x-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl flex-1"></div>
            ))}
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex space-x-4 border-b">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-t-lg w-24"></div>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: 3 }).map((_, k) => (
                  <div key={k} className="h-8 bg-gray-300 rounded w-20"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};