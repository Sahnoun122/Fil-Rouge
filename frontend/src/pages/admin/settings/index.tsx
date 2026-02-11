'use client';

// pages/admin/settings/page.tsx - Paramètres système

import AdminLayout from '../../../components/layout/AdminLayout';

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Paramètres Système">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Paramètres Système
          </h1>
          <p className="text-gray-600 mt-2">
            Configuration et maintenance de la plateforme
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Configuration système</h2>
          <p className="text-gray-600">
            Interface de paramétrage système à implémenter.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}