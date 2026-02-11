'use client';

// components/Navbar.tsx - Navigation principale selon le rôle

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Si l'utilisateur est connecté, rediriger vers son layout spécifique
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      // Rediriger vers le layout admin
      if (!router.pathname.startsWith('/admin')) {
        router.push('/admin/dashboard/page');
      }
      return null; // AdminLayout prendra le relais
    } else {
      // Rediriger vers le layout user  
      if (!router.pathname.startsWith('/user') && router.pathname !== '/dashboard') {
        router.push('/dashboard');
      }
      return null; // UserLayout prendra le relais
    }
  }

  // Navbar pour les visiteurs non connectés
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
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

          {/* Navigation visiteurs */}
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
            
            {/* Auth buttons */}
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

                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span>{user?.fullName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mon Profil
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Menu utilisateur non connecté */}
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center px-4 py-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{user?.fullName}</span>
                </div>
                
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon Profil
                </Link>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}