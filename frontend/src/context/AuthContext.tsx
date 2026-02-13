'use client';

// context/AuthContext.tsx - Context API pour la gestion de l'utilisateur

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, User, LoginData, RegisterData } from '../services/authService';
import { redirectAfterLogin } from '../utils/roleRedirect';
import { TokenValidator } from '../utils/tokenValidator';

// Types pour le contexte
interface AuthContextType {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
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
    // Nettoyer les tokens invalides au démarrage
    TokenValidator.cleanupInvalidTokens();
    
    // Vérifier l'état d'authentification
    checkAuthStatus();
  }, []);

  // 🔍 Vérifier le statut d'authentification
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 🎭 Mode Demo - Simuler un utilisateur connecté
      if (process.env.NODE_ENV === 'development') {
        // Créer un utilisateur demo
        const demoUser: User = {
          id: 'demo-user-id',
          email: 'user@demo.com', 
          fullName: 'Utilisateur Demo',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(demoUser);
        setIsLoading(false);
        return;
      }

      const isAuth = await AuthService.checkAuth();
      
      if (isAuth) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      
      // En mode développement, utiliser le mode demo même en cas d'erreur
      if (process.env.NODE_ENV === 'development') {
        const demoUser: User = {
          id: 'demo-user-id',
          email: 'user@demo.com', 
          fullName: 'Utilisateur Demo',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(demoUser);
        setIsLoading(false);
        return;
      }
      
      // Nettoyer les tokens invalides/expirés
      if (error.message?.includes('token') || 
          error.message?.includes('refresh') ||
          error.message?.includes('expiré') ||
          error.message?.includes('invalide')) {
        // Nettoyer silencieusement les tokens invalides
        AuthService.logout();
      }
      
      setUser(null);
      setError(null); // Ne pas afficher d'erreur pour la vérification initiale
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 Connexion
  const login = async (data: LoginData): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      // 🎭 Mode Demo
      if (process.env.NODE_ENV === 'development') {
        // Simuler une connexion réussie
        const demoUser: User = {
          id: 'demo-user-id',
          email: data.email,
          fullName: 'Utilisateur Demo',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(demoUser);
        return demoUser;
      }

      const response = await AuthService.login(data);
      setUser(response.user);
      
      return response.user;
      
    } catch (error) {
      // En mode développement, toujours réussir la connexion
      if (process.env.NODE_ENV === 'development') {
        const demoUser: User = {
          id: 'demo-user-id',
          email: data.email,
          name: 'Utilisateur Demo',
          role: 'user',
          createdAt: new Date().toISOString(),
          isVerified: true
        };
        
        setUser(demoUser);
        return demoUser;
      }
      
      const message = error instanceof Error ? error.message : 'Erreur lors de la connexion';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 📝 Inscription  
  const register = async (data: RegisterData): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      // 🎭 Mode Demo
      if (process.env.NODE_ENV === 'development') {
        // Simuler une inscription réussie
        const demoUser: User = {
          id: 'demo-user-id',
          email: data.email,
          name: data.name,
          role: 'user',
          createdAt: new Date().toISOString(),
          isVerified: true
        };
        
        setUser(demoUser);
        return demoUser;
      }

      const response = await AuthService.register(data);
      setUser(response.user);
      
      return response.user;
      
    } catch (error) {
      // En mode développement, toujours réussir l'inscription
      if (process.env.NODE_ENV === 'development') {
        const demoUser: User = {
          id: 'demo-user-id',
          email: data.email,
          name: data.name,
          role: 'user',
          createdAt: new Date().toISOString(),
          isVerified: true
        };
        
        setUser(demoUser);
        return demoUser;
      }
      
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

      // 🎭 Mode Demo - Juste déconnecter localement
      if (process.env.NODE_ENV === 'development') {
        setUser(null);
        setIsLoading(false);
        window.location.href = '/';
        return;
      }

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

      // 🎭 Mode Demo - Mettre à jour localement
      if (process.env.NODE_ENV === 'development' && user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        setIsLoading(false);
        return;
      }

      const updatedUser = await AuthService.updateProfile(data);
      setUser(updatedUser);
      
    } catch (error) {
      // En mode développement, toujours réussir la mise à jour
      if (process.env.NODE_ENV === 'development' && user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        setIsLoading(false);
        return;
      }
      
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