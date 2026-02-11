'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Si l'utilisateur est connecté, rediriger vers son layout spécifique
  if (isAuthenticated && user) {
    try {
      if (user.role === 'admin') {
        // Rediriger vers le layout admin
        if (!router.pathname.startsWith('/admin')) {
          router.push('/admin/dashboard');
        }
        return null; // AdminLayout prendra le relais
      } else {
        // Rediriger vers le layout user  
        if (!router.pathname.startsWith('/user')) {
          router.push('/user/dashboard');
        }
        return null; // UserLayout prendra le relais
      }
    } catch (error) {
      console.error('Erreur de redirection dans Navbar:', error);
      // En cas d'erreur, laisser la navbar s'afficher
    }
  }

  // Navbar pour les visiteurs non connectés
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">MarketPlan IA</span>
                <span className="text-xs text-gray-500 -mt-1">Stratégie Marketing Intelligente</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium">
              Fonctionnalités
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              Tarifs
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
              À propos
            </Link>
            
            <div className="flex items-center space-x-4 ml-8">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 px-4 py-2 font-medium"
              >
                Se connecter
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}