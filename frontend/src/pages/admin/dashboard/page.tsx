'use client';

// pages/admin/dashboard/page.tsx - Dashboard Administrateur

import AdminLayout from '../../../components/layout/AdminLayout';

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard Administrateur">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de la plateforme MarketPlan IA
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Bienvenue dans l'administration</h2>
          <p className="text-gray-600">
            Utilisez la navigation principale pour accéder aux différentes sections d'administration.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}