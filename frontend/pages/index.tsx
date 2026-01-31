import React from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  DocumentArrowDownIcon, 
  PresentationChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CameraIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation intégrée pour la landing page */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-blue-600">
              Marketing Intelligent
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 transition duration-300"
              >
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 1 - Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transformez votre marketing en une stratégie claire
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Créez un plan marketing et un calendrier de contenu en quelques minutes.
          </p>
          <Link 
            href="/register"
            className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-4 px-8 rounded-lg transition duration-300 inline-block"
          >
            🟢 Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Section 2 - Problème */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Les défis du marketing digital
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <ArrowTrendingDownIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Publication aléatoire
              </h3>
              <p className="text-gray-600">
                Publier sans stratégie claire ni cohérence
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Contenu sans résultats
              </h3>
              <p className="text-gray-600">
                Créer du contenu qui n'engage pas votre audience
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <ClockIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Efforts sans ventes
              </h3>
              <p className="text-gray-600">
                Travailler dur sans voir de retour sur investissement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Solution */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Notre solution en 3 étapes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Définissez votre marché
              </h3>
              <p className="text-gray-600">
                Identifiez votre audience cible et ses besoins
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Générez votre stratégie
              </h3>
              <p className="text-gray-600">
                Notre IA crée automatiquement votre plan marketing
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Planifiez votre contenu
              </h3>
              <p className="text-gray-600">
                Organisez vos publications selon votre stratégie
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités puissantes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <ChartBarIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Plan marketing en 1 page
              </h3>
              <p className="text-gray-600">
                Stratégie complète et claire
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <CalendarIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Planning contenu
              </h3>
              <p className="text-gray-600">
                Calendrier intelligent et organisé
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <DocumentArrowDownIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Export PDF
              </h3>
              <p className="text-gray-600">
                Téléchargez votre stratégie
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <PresentationChartBarIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tableau de bord
              </h3>
              <p className="text-gray-600">
                Suivez vos performances
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Pour qui ? */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Parfait pour
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Target 1 */}
            <div className="text-center">
              <UserGroupIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Freelancers
              </h3>
              <p className="text-gray-600">
                Développez votre activité indépendante
              </p>
            </div>
            
            {/* Target 2 */}
            <div className="text-center">
              <BuildingOfficeIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                PME
              </h3>
              <p className="text-gray-600">
                Structurez votre marketing digital
              </p>
            </div>
            
            {/* Target 3 */}
            <div className="text-center">
              <CameraIcon className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Créateurs
              </h3>
              <p className="text-gray-600">
                Monétisez votre audience efficacement
              </p>
            </div>
            
            {/* Target 4 */}
            <div className="text-center">
              <AcademicCapIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Marketeurs débutants
              </h3>
              <p className="text-gray-600">
                Apprenez avec des outils intelligents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - CTA final */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer votre marketing ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'entrepreneurs qui font confiance à notre plateforme
          </p>
          <Link 
            href="/register"
            className="bg-white hover:bg-gray-100 text-blue-600 text-xl font-semibold py-4 px-12 rounded-lg transition duration-300 inline-block shadow-lg"
          >
            Commencer maintenant - C'est gratuit 🚀
          </Link>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2026 Marketing Intelligent. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}