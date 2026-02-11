'use client';

// pages/login.tsx - Page de connexion

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { redirectAfterLogin } from '../utils/roleRedirect';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Rediriger si déjà connecté - selon le rôle
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true);
      const dashboardUrl = redirectAfterLogin(user);
      
      // Délai court pour améliorer l'UX
      setTimeout(() => {
        try {
          router.push(dashboardUrl);
        } catch (error) {
          console.error('Erreur de redirection automatique:', error);
          router.push('/user/dashboard'); // Fallback sécurisé
        }
      }, 500);
    }
  }, [isAuthenticated, user, router, isRedirecting]);

  // Nettoyer les erreurs quand le composant se monte
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Nettoyer les erreurs lors de la saisie
    if (formError) setFormError('');
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation simple
    if (!formData.email || !formData.password) {
      setFormError('Tous les champs sont requis');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Email invalide');
      return;
    }

    try {
      const user = await login(formData);
      
      // Message de succès et redirection
      setIsRedirecting(true);
      const dashboardUrl = redirectAfterLogin(user);
      
      // Notification de succès optionnelle
      setTimeout(() => {
        try {
          router.push(dashboardUrl);
        } catch (redirectError) {
          console.error('Erreur lors de la redirection:', redirectError);
          // Fallback vers dashboard utilisateur
          router.push('/user/dashboard');
        }
      }, 300);
    } catch (err) {
      // L'erreur sera affichée via le contexte
    }
  };

  const displayError = formError || error;

  // Affichage pendant la redirection
  if (isRedirecting) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion réussie !</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Se connecter
          </h1>
          <p className="text-gray-600">
            Accédez à votre compte MarketPlan IA
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{displayError}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              S'inscrire
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Compte de démonstration
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Email :</strong> demo@example.com</p>
          <p><strong>Mot de passe :</strong> demo123</p>
        </div>
      </div>
    </div>
  );
}