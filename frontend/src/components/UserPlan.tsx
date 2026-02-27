'use client';

import { useAuth } from '../hooks/useAuth';

export default function UserPlan() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Informations du compte</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Informations personnelles</h4>
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
                <span className="text-sm text-gray-500">Telephone</span>
                <span className="text-sm font-medium text-gray-900">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {(user.companyName || user.industry) && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Informations professionnelles</h4>
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

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Etat du compte</h4>
          <div className="space-y-2">
            {user.lastLoginAt && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Derniere connexion</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.lastLoginAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Membre depuis</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
