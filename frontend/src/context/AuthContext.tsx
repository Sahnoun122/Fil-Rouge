'use client';

// context/AuthContext.tsx - Context API pour la gestion de l'utilisateur

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, User, LoginData, RegisterData } from '../services/authService';

// Types pour le contexte
interface AuthContextType {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Vérifier le statut d'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 🔍 Vérifier le statut d'authentification
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const isAuth = await AuthService.checkAuth();
      
      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setError(null); // Ne pas afficher d'erreur pour la vérification initiale
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 Connexion
  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.login(data);
      setUser(response.user);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la connexion';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 📝 Inscription
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.register(data);
      setUser(response.user);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Déconnexion
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthService.logout();
      setUser(null);
      
      // Rediriger vers la page d'accueil
      window.location.href = '/';
      
    } catch (error) {
      // Même si la déconnexion côté serveur échoue, on déconnecte côté client
      console.error('Logout error:', error);
      setUser(null);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  // 👤 Mise à jour du profil
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await AuthService.updateProfile(data);
      setUser(updatedUser);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🧹 Effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  // Valeurs du contexte
  const value: AuthContextType = {
    // État
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

// Export par défaut du contexte
export default AuthContext;