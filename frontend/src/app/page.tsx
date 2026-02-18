import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              Créez des stratégies marketing
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                générées par l'IA
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Transformez votre approche marketing avec des stratégies personnalisées, 
              une analyse SWOT avancée, et des outils de planification intelligents.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/strategies/new"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center shadow-xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link 
                href="/features"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Découvrir les fonctionnalités
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Preview */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre plateforme ?
            </h2>
            <p className="text-xl text-gray-600">
              Des outils puissants pour des résultats exceptionnels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                IA Avancée
              </h3>
              <p className="text-gray-600">
                Des stratégies marketing personnalisées générées par une IA de pointe
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Analyse SWOT
              </h3>
              <p className="text-gray-600">
                Analysez vos forces, faiblesses, opportunités et menaces automatiquement
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Collaboration
              </h3>
              <p className="text-gray-600">
                Travaillez en équipe et partagez vos stratégies facilement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}