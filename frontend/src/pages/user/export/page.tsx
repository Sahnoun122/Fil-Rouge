'use client';

// pages/user/export/page.tsx - Export PDF utilisateur

import UserLayout from '../../../components/layout/UserLayout';

export default function UserExportPage() {
  return (
    <UserLayout title="Export PDF">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Export PDF
          </h1>
          <p className="text-gray-600 mt-2">
            Exportez vos stratégies et analyses en format PDF
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Génération de rapports</h2>
          <p className="text-gray-600">
            Interface d'export PDF à implémenter.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}