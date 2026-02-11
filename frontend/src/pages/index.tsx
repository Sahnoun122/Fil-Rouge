// pages/index.tsx - Page d'accueil

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Bienvenue sur{' '}
          <span className="text-blue-600">MarketPlan IA</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
          La plateforme d'intelligence artificielle pour créer des stratégies marketing 
          performantes et optimiser votre présence en ligne.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                Accéder au Dashboard
              </Link>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-gray-600">Connecté en tant que</span>
                <span className="font-medium text-gray-900">{user?.fullName}</span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-medium"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Pourquoi choisir MarketPlan IA ?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              IA Puissante
            </h3>
            <p className="text-gray-600">
              Algorithmes d'intelligence artificielle avancés pour des stratégies marketing optimisées
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyses SWOT
            </h3>
            <p className="text-gray-600">
              Analyses approfondies de vos forces, faiblesses, opportunités et menaces
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Rapports Détaillés
            </h3>
            <p className="text-gray-600">
              Exports PDF et rapports complets pour présenter vos stratégies
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 border-t border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ils nous font confiance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-600">1,000+</div>
              <div className="text-gray-600">Entreprises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">10,000+</div>
              <div className="text-gray-600">Stratégies créées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">50,000+</div>
              <div className="text-gray-600">Publications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      {!isAuthenticated && (
        <div className="py-16 border-t border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à transformer votre marketing ?
          </h2>
          <p className="text-gray-600 mb-8">
            Rejoignez des milliers d'entreprises qui utilisent MarketPlan IA
          </p>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-block"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      )}
    </div>
  );
}