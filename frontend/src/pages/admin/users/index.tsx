'use client';

// pages/admin/users/page.tsx - Gestion des utilisateurs

import AdminLayout from '../../../components/layout/AdminLayout';

export default function AdminUsersPage() {
  return (
    <AdminLayout title="Gestion des Utilisateurs">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 mt-2">
            Administrez les comptes utilisateurs de la plateforme
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Utilisateurs de la plateforme</h2>
          <p className="text-gray-600">
            Interface de gestion des utilisateurs à implémenter.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}