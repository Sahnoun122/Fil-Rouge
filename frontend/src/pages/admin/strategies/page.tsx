'use client';

// pages/admin/strategies/page.tsx - Supervision des stratégies

import AdminLayout from '../../../components/layout/AdminLayout';

export default function AdminStrategiesPage() {
  return (
    <AdminLayout title="Supervision Stratégies">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Supervision des Stratégies
          </h1>
          <p className="text-gray-600 mt-2">
            Supervisez et modérez les stratégies créées par les utilisateurs
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Supervision des stratégies</h2>
          <p className="text-gray-600">
            Interface de supervision des stratégies à implémenter.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}