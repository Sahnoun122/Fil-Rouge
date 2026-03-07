'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Eye,
  MoreHorizontal,
  Trash2,
  Calendar,
  Building,
  Users,
  Target,
  DollarSign,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useStrategiesList } from '../../../hooks/useStrategies';
import { Strategy, OBJECTIVE_LABELS, TONE_LABELS } from '../../../types/strategy.types';
import strategiesService from '../../../services/strategiesService';
import { generateStrategyPdf } from '../../../lib/strategyPdf';

// Composant pour l'état vide
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 max-w-lg mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
      No strategies yet
      </h3>
      <p className="text-gray-600 mb-8 text-lg">
        Start by creating your first AI-powered personalized marketing strategy
      </p>
      <Link href="/user/strategies/new">
        <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5 mr-2" />
          Create my first strategy
        </button>
      </Link>
    </div>
  </div>
);

// Composant pour le squelette de chargement
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="mt-6">
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Composant pour une carte de stratégie
interface StrategyCardProps {
  strategy: Strategy;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  isDeleting?: boolean;
  isDownloading?: boolean;
}

const StrategyCard = ({
  strategy,
  onDelete,
  onDownload,
  isDeleting = false,
  isDownloading = false,
}: StrategyCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleView = () => {
    router.push(`/user/strategies/${strategy._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await onDelete(strategy._id);
        toast.success('Strategy deleted successfully');
      } catch {
        toast.error('Error deleting strategy');
      }
    }
    setShowMenu(false);
  };

  const handleDownload = () => {
    onDownload(strategy._id);
    setShowMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Not defined';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900 text-lg truncate">
              {strategy.businessInfo.businessName}
            </h3>
            <p className="text-sm text-gray-500">
              {strategy.businessInfo.industry}
            </p>
          </div>
        </div>

        {/* Menu contextuel */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={handleView}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View details
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Informations clés */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          <span>{strategy.businessInfo.targetAudience}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Target className="w-4 h-4 mr-2 text-gray-400" />
          <span>{OBJECTIVE_LABELS[strategy.businessInfo.mainObjective]}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatBudget(strategy.businessInfo.budget)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>Created on {formatDate(strategy.createdAt)}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          {TONE_LABELS[strategy.businessInfo.tone]}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          {strategy.businessInfo.location}
        </span>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <button
          onClick={handleView}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          View full strategy
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full border border-gray-300 bg-white text-gray-700 text-sm font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

// Composant principal
export default function StrategiesPage() {
  const {
    strategies,
    pagination,
    isLoading,
    error,
    deleteStrategy,
    changePage,
    refresh,
  } = useStrategiesList();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterBy, setFilterBy] = useState<'all' | string>('all');
  const [downloadingStrategyId, setDownloadingStrategyId] = useState<string | null>(null);

  // Filtrer et trier les stratégies
  const filteredStrategies = strategies
    .filter(strategy => {
      const matchesSearch = strategy.businessInfo.businessName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        strategy.businessInfo.industry
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
        strategy.businessInfo.mainObjective === filterBy;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.businessInfo.businessName.localeCompare(b.businessInfo.businessName);
      }
    });

  const handleDeleteStrategy = async (id: string) => {
    await deleteStrategy(id);
  };

  const handleDownloadStrategy = async (id: string) => {
    setDownloadingStrategyId(id);
    try {
      const payload = await strategiesService.getStrategyPdfPayload(id);
      generateStrategyPdf(payload);
      toast.success('PDF generated successfully');
    } catch {
      toast.error('Error generating PDF');
    } finally {
      setDownloadingStrategyId(null);
    }
  };

  if (isLoading && strategies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Strategies</h1>
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Marketing Strategies</h1>
            <p className="text-gray-600 mt-2">
              {strategies.length > 0 
                ? `${pagination.total} strategy${pagination.total > 1 ? 'ies' : ''} found`
                : 'Manage your AI-generated marketing strategies'
              }
            </p>
          </div>
          
                  <Link href="/user/strategies/new">
            <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus className="w-5 h-5 mr-2" />
              New Strategy
            </button>
          </Link>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={refresh}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filtres et recherche */}
        {strategies.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company name or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtre par objectif */}
              <div className="sm:w-48">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All objectives</option>
                  {Object.entries(OBJECTIVE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Tri */}
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Most recent</option>
                  <option value="name">By name</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Liste des stratégies */}
        {filteredStrategies.length === 0 && strategies.length === 0 ? (
          <EmptyState />
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No strategy matches your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredStrategies.map((strategy) => (
                <StrategyCard
                  key={strategy._id}
                  strategy={strategy}
                  onDelete={handleDeleteStrategy}
                  onDownload={handleDownloadStrategy}
                  isDeleting={isLoading}
                  isDownloading={downloadingStrategyId === strategy._id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} strategies
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.pages || 
                        Math.abs(page - pagination.page) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => changePage(page)}
                            className={`px-3 py-2 text-sm rounded-lg ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))
                    }
                  </div>
                  
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
