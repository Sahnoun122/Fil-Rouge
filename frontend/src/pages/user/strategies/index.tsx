'use client';

// pages/user/strategies/page.tsx - Gestion des stratégies utilisateur

import UserLayout from '../../../components/layout/UserLayout';

export default function UserStrategiesPage() {
  return (
    <UserLayout title="Mes Stratégies">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Mes Stratégies Marketing
          </h1>
          <p className="text-gray-600 mt-2">
            Créez et gérez vos stratégies marketing intelligentes
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Vos stratégies marketing</h2>
          <p className="text-gray-600">
            Interface de gestion des stratégies à implémenter.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}