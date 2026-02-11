'use client';

// pages/admin/dashboard.tsx - Dashboard administrateur

import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard Administrateur">
      <div className="p-6">
        {/* Header Admin */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user?.fullName} - Administration MarketPlan IA
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Administration MarketPlan IA</h2>
          <p className="text-gray-600">
            Interface d'administration professionnelle. Utilisez la navigation principale pour accéder aux outils d'administration.
          </p>
        </div>
      </div>
    </AdminLayout>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Statistiques principales */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Utilisateurs */}
              <div className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                </div>
              </div>

              {/* Plans créés */}
              <div className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Plans générés</p>
                    <p className="text-2xl font-bold text-gray-900">5,678</p>
                  </div>
                </div>
              </div>

              {/* Revenus */}
              <div className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus mensuels</p>
                    <p className="text-2xl font-bold text-gray-900">€12,450</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions d'administration */}
            <div className="bg-white rounded-lg shadow border p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Actions administrateur
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Gérer utilisateurs</h3>
                  <p className="text-sm text-gray-500">Voir, modifier ou supprimer des comptes</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Rapports détaillés</h3>
                  <p className="text-sm text-gray-500">Analytics et métriques</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Configuration</h3>
                  <p className="text-sm text-gray-500">Paramètres système, tarifs</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Modération</h3>
                  <p className="text-sm text-gray-500">Contenus signalés, abus</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Analytics IA</h3>
                  <p className="text-sm text-gray-500">Performance des modèles IA</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Base de données</h3>
                  <p className="text-sm text-gray-500">Sauvegardes, maintenance</p>
                </button>
              </div>
            </div>

            {/* Dernières activités système */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Activités système récentes
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nouveau utilisateur inscrit</p>
                    <p className="text-xs text-gray-500">john.doe@email.com - Il y a 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Plan marketing généré</p>
                    <p className="text-xs text-gray-500">Plan SWOT pour "Startup Tech" - Il y a 12 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Mise à jour système</p>
                    <p className="text-xs text-gray-500">Version 2.1.3 déployée - Il y a 1 heure</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Rapport mensuel généré</p>
                    <p className="text-xs text-gray-500">Analytics janvier 2026 - Il y a 2 heures</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Admin */}
          <div className="space-y-6">
            {/* Info Admin */}
            <div className="bg-white rounded-lg shadow border p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.fullName}</h3>
                <p className="text-red-600 font-medium">Administrateur</p>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
              </div>
            </div>

            {/* Alertes système */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                ⚠️ Alertes système
              </h3>
              <div className="space-y-2">
                <p className="text-yellow-700 text-sm">
                  • 3 utilisateurs en attente de validation
                </p>
                <p className="text-yellow-700 text-sm">
                  • Espace disque à 85% de capacité
                </p>
                <p className="text-yellow-700 text-sm">
                  • 2 signalements en attente
                </p>
              </div>
            </div>

            {/* Raccourcis admin */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Raccourcis
              </h3>
              <div className="space-y-3">
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  🛠️ Outils d'administration
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  📊 Tableau de bord complet
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  📧 Envoyer newsletter
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  🔧 Maintenance système
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  📝 Logs système
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}