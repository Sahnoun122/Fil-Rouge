'use client';

// components/UserPlan.tsx - Composant affichant les informations utilisateur

import { useAuth } from '../hooks/useAuth';

export default function UserPlan() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Informations du compte</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          user.role === 'admin' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Informations personnelles */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Informations personnelles</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nom complet</span>
              <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Téléphone</span>
                <span className="text-sm font-medium text-gray-900">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations professionnelles */}
        {(user.companyName || user.industry) && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informations professionnelles</h4>
            <div className="space-y-2">
              {user.companyName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Entreprise</span>
                  <span className="text-sm font-medium text-gray-900">{user.companyName}</span>
                </div>
              )}
              {user.industry && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Secteur</span>
                  <span className="text-sm font-medium text-gray-900">{user.industry}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statut du compte */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Statut du compte</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Statut</span>
              <span className={`text-sm font-medium ${
                user.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Email vérifié</span>
              <span className={`text-sm font-medium ${
                user.emailVerified ? 'text-green-600' : 'text-orange-600'
              }`}>
                {user.emailVerified ? 'Vérifié' : 'En attente'}
              </span>
            </div>
            {user.lastLoginAt && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Dernière connexion</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.lastLoginAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Membre depuis */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Membre depuis</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}