'use client';

// pages/user/strategies/index.tsx - Gestion des stratégies utilisateur

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '../../../components/layout/UserLayout';
import { MarketingStrategy } from '../../../types/strategy';
import { Plus, Eye, Calendar, TrendingUp } from 'lucide-react';

export default function UserStrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<MarketingStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les stratégies depuis localStorage
    const loadStrategies = () => {
      try {
        const saved = localStorage.getItem('user_strategies');
        if (saved) {
          setStrategies(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading strategies:', error);
      }
      setLoading(false);
    };

    loadStrategies();
  }, []);

  const handleCreateStrategy = () => {
    router.push('/user/strategies/create');
  };

  const handleViewStrategy = (id: string) => {
    router.push(`/user/strategies/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <UserLayout title="Mes Stratégies">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Mes Stratégies">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mes Stratégies Marketing
            </h1>
            <p className="text-gray-600 mt-2">
              Créez et gérez vos stratégies marketing avec l'IA
            </p>
          </div>
          
          <button
            onClick={handleCreateStrategy}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Stratégie
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-violet-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stratégies</p>
                <p className="text-2xl font-bold text-gray-900">{strategies.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complétées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {strategies.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {strategies.filter(s => s.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategies List */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Vos Stratégies</h2>
          </div>

          {strategies.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune stratégie créée
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre première stratégie marketing avec l'IA
              </p>
              <button
                onClick={handleCreateStrategy}
                className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer ma première stratégie
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewStrategy(strategy.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          Stratégie {strategy.businessForm.companyName}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(strategy.status || 'draft')}`}>
                          {strategy.status === 'completed' && 'Complétée'}
                          {strategy.status === 'in-progress' && 'En cours'}
                          {strategy.status === 'draft' && 'Brouillon'}
                          {!strategy.status && 'Nouveau'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Secteur:</span> {strategy.businessForm.industry}
                      </p>
                      
                      <p className="text-gray-600 mb-3">
                        <span className="font-medium">Objectif:</span> {strategy.businessForm.objective}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          Créée le {new Date(strategy.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewStrategy(strategy.id);
                        }}
                        className="inline-flex items-center px-3 py-2 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}