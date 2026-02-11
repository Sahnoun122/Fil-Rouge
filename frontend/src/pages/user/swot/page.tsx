'use client';

// pages/user/swot/page.tsx - Analyse SWOT

import UserLayout from '../../../components/layout/UserLayout';

export default function UserSWOTPage() {
  return (
    <UserLayout title="SWOT Analysis">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            SWOT Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Analysez la position stratégique de votre entreprise
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Analyse SWOT</h2>
          <p className="text-gray-600">
            Module d'analyse SWOT à implémenter.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}