import React from 'react';

interface LoadingSkeletonProps {
  type?: 'form' | 'strategy' | 'card' | 'progress';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card' }) => {
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
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
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