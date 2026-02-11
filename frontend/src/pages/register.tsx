'use client';

// pages/register.tsx - Page d'inscription

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { redirectAfterLogin } from '../utils/roleRedirect';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    industry: ''
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Nettoyer les erreurs lors de la saisie
    if (formError) setFormError('');
    if (error) clearError();
  };

  const validateForm = (): string | null => {
    // Vérifier les champs requis
    if (!formData.fullName || !formData.email || !formData.password || 
        !formData.phone || !formData.companyName || !formData.industry) {
      return 'Tous les champs sont requis';
    }

    // Vérifier l'email
    if (!formData.email.includes('@')) {
      return 'Email invalide';
    }

    // Vérifier le mot de passe
    if (formData.password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Vérifier la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }

    // Vérifier le format du téléphone
    if (!/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      return 'Format de téléphone invalide';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      // Préparer les données pour l'API (sans confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      const user = await register(registerData);
      
      // Message de succès et redirection
      setIsRedirecting(true);
      const dashboardUrl = redirectAfterLogin(user);
      
      // Notification de succès pour l'inscription
      setTimeout(() => {
        try {
          router.push(dashboardUrl);
        } catch (redirectError) {
          console.error('Erreur lors de la redirection:', redirectError);
          // Fallback vers dashboard utilisateur
          router.push('/user/dashboard');
        }
      }, 800); // Délai plus long pour l'inscription
    } catch (err) {
      // L'erreur sera affichée via le contexte
    }
  };

  const displayError = formError || error;

  // Affichage pendant la redirection
  if (isRedirecting) {
    return (
      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inscription réussie !</h2>
          <p className="text-gray-600">Bienvenue ! Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-600">
            Rejoignez MarketPlan IA gratuitement
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
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jean Dupont"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="jean@example.com"
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
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+33 1 23 45 67 89"
              required
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mon Entreprise SAS"
              required
              autoComplete="organization"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Secteur d'activité
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un secteur</option>
              <option value="Technology">Technologie</option>
              <option value="Healthcare">Santé</option>
              <option value="Finance">Finance</option>
              <option value="Education">Éducation</option>
              <option value="Retail">Commerce</option>
              <option value="Manufacturing">Industrie</option>
              <option value="Consulting">Conseil</option>
              <option value="Real Estate">Immobilier</option>
              <option value="Food">Alimentation</option>
              <option value="Transportation">Transport</option>
              <option value="Other">Autre</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création du compte...
              </div>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Se connecter
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}