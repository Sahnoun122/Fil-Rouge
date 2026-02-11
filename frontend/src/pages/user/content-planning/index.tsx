'use client';

// pages/user/content-planning/page.tsx - Planning de contenu utilisateur

import UserLayout from '../../../components/layout/UserLayout';

export default function UserContentPlanningPage() {
  return (
    <UserLayout title="Planning Contenu">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Planning de Contenu
          </h1>
          <p className="text-gray-600 mt-2">
            Planifiez et organisez vos publications sur les réseaux sociaux
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Calendrier de contenu</h2>
          <p className="text-gray-600">
            Interface de planning de contenu à implémenter.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}