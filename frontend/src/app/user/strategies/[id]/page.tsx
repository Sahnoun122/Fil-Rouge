'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  Calendar,
  Building,
  Users,
  Target,
  DollarSign,
  Globe,
  MessageSquare,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useStrategy, useStrategies } from '../../../hooks/useStrategies';
import { OBJECTIVE_LABELS, TONE_LABELS, StrategySection } from '../../../types/strategy.types';

// Composant de chargement
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Composant pour une section de stratégie
interface StrategySectionProps {
  title: string;
  content: string;
  sectionKey: keyof StrategySection;
  strategyId: string;
  onRegenerate: (sectionKey: keyof StrategySection, content: string) => void;
  isRegenerating?: boolean;
}

const StrategySectionComponent = ({ 
  title, 
  content, 
  sectionKey, 
  strategyId, 
  onRegenerate,
  isRegenerating = false 
}: StrategySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);
  
  const isLongContent = content.length > 500;
  const displayContent = showFullContent || !isLongContent 
    ? content 
    : content.substring(0, 500) + '...';

  const handleRegenerate = () => {
    if (window.confirm(`Voulez-vous régénérer la section "${title}" ?`)) {
      onRegenerate(sectionKey, content);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div 
        className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400 mr-2" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 mr-2" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRegenerate();
            }}
            disabled={isRegenerating}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
            Régénérer
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          <div className="prose max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: displayContent.replace(/\n/g, '<br />')
              }}
            />
          </div>
          
          {isLongContent && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showFullContent ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Voir moins
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Voir plus
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Composant principal
export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;
  
  const { strategy, isLoading, error, refetch } = useStrategy(strategyId);
  const { regenerateSection, deleteStrategy } = useStrategies();
  
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rediriger si pas d'ID
  useEffect(() => {
    if (!strategyId) {
      router.replace('/user/strategies');
    }
  }, [strategyId, router]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette stratégie ? Cette action est irréversible.')) {
      setIsDeleting(true);
      try {
        await deleteStrategy(strategyId);
        toast.success('Stratégie supprimée avec succès');
        router.push('/user/strategies');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        setIsDeleting(false);
      }
    }
  };

  const handleRegenerateSection = async (sectionKey: keyof StrategySection, currentContent: string) => {
    setIsRegenerating(sectionKey);
    try {
      await regenerateSection(strategyId, sectionKey, currentContent);
      toast.success('Section régénérée avec succès');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la régénération');
    } finally {
      setIsRegenerating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(budget);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Stratégie introuvable
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Cette stratégie n\'existe pas ou a été supprimée.'}
            </p>
            <Link
              href="/user/strategies"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux stratégies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/user/strategies" className="hover:text-gray-700 transition-colors">
            Stratégies
          </Link>
          <span>•</span>
          <span className="text-gray-900 font-medium truncate max-w-64">
            {strategy.businessInfo.businessName}
          </span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {strategy.businessInfo.businessName}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {strategy.businessInfo.industry}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {OBJECTIVE_LABELS[strategy.businessInfo.mainObjective]}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                      {TONE_LABELS[strategy.businessInfo.tone]}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {strategy.businessInfo.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
              
              <Link
                href={`/user/strategies/${strategy._id}/edit`}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            
            {/* Informations sur la stratégie générée */}
            {strategy.generatedStrategy && (
              <>
                <StrategySectionComponent
                  title="📊 Analyse de Marché"
                  content={strategy.generatedStrategy.avant.analyseMarche}
                  sectionKey="analyseMarche"
                  strategyId={strategy._id}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating === 'analyseMarche'}
                />

                <StrategySectionComponent
                  title="🎯 Positionnement"
                  content={strategy.generatedStrategy.avant.positionnement}
                  sectionKey="positionnement"
                  strategyId={strategy._id}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating === 'positionnement'}
                />

                <StrategySectionComponent
                  title="📈 Plan d'Action"
                  content={strategy.generatedStrategy.pendant.planAction}
                  sectionKey="planAction"
                  strategyId={strategy._id}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating === 'planAction'}
                />

                <StrategySectionComponent
                  title="💰 Budget et Ressources"
                  content={strategy.generatedStrategy.pendant.budget}
                  sectionKey="budget"
                  strategyId={strategy._id}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating === 'budget'}
                />

                <StrategySectionComponent
                  title="📊 Métriques et KPIs"
                  content={strategy.generatedStrategy.apres.kpis}
                  sectionKey="kpis"
                  strategyId={strategy._id}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating === 'kpis'}
                />

                <StrategySectionComponent
                  title="🔄 Optimisation Continue"
                  content={strategy.generatedStrategy.apres.optimisation}
                  sectionKey="optimisation"
                  strategyId={strategy._id}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating === 'optimisation'}
                />
              </>
            )}

            {!strategy.generatedStrategy && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Stratégie en cours de génération
                </h3>
                <p className="text-gray-600">
                  La stratégie détaillée n'est pas encore disponible.
                </p>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Informations générales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Informations Générales
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Public Cible</label>
                  <p className="text-gray-900 font-medium">{strategy.businessInfo.targetAudience}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Budget</label>
                  <p className="text-gray-900 font-medium">{formatBudget(strategy.businessInfo.budget)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Localisation</label>
                  <p className="text-gray-900 font-medium flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {strategy.businessInfo.location}
                  </p>
                </div>

                {strategy.businessInfo.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Site Web</label>
                    <a 
                      href={strategy.businessInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-words"
                    >
                      {strategy.businessInfo.website}
                    </a>
                  </div>
                )}

                {strategy.businessInfo.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {strategy.businessInfo.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Méta informations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Méta Informations
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de création</label>
                  <p className="text-gray-900 font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(strategy.createdAt)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Dernière mise à jour</label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(strategy.updatedAt)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Actions Rapides
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter en PDF
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </button>
                
                <button 
                  onClick={() => refetch()}
                  className="w-full flex items-center justify-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
