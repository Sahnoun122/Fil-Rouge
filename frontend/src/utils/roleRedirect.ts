// utils/roleRedirect.ts - Utilitaires pour la gestion des rôles et redirections

import { User } from '../types/auth';

// Type pour les rôles disponibles
export type UserRole = 'user' | 'admin';

// Fonction pour obtenir l'URL du dashboard selon le rôle
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'user':
    default:
      return '/user/dashboard';
  }
}

// Fonction pour vérifier si un utilisateur a le rôle requis
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  // Les admins ont accès à tout
  if (user.role === 'admin') return true;
  
  // Sinon, vérifier le rôle exact
  return user.role === requiredRole;
}

// Fonction pour rediriger automatiquement après login
export function redirectAfterLogin(user: User): string {
  // Validation de sécurité
  if (!user || !user.role) {
    console.warn('Utilisateur ou rôle manquant lors de la redirection');
    return '/user/dashboard'; // Fallback sécurisé
  }

  // Redirection selon le rôle avec validation
  switch (user.role) {
    case 'admin':
      return '/admin/dashboard';
    case 'user':
      return '/user/dashboard';
    default:
      console.warn(`Rôle non reconnu: ${user.role}, redirection verso dashboard user`);
      return '/user/dashboard';
  }
}

// Fonction pour obtenir l'URL de redirection avec fallback
export function getRedirectUrl(user: User | null, fallback: string = '/'): string {
  if (!user) return fallback;
  return redirectAfterLogin(user);
}

// Fonction pour vérifier l'autorisation d'accès à une route
export function isAuthorizedForRoute(user: User | null, requiredRole?: UserRole): boolean {
  if (!user) return false;
  
  // Si aucun rôle requis, l'utilisateur connecté suffit
  if (!requiredRole) return true;
  
  return hasRole(user, requiredRole);
}

// Fonction pour obtenir le nom formaté du rôle
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'user':
      return 'Utilisateur';
    default:
      return 'Utilisateur';
  }
}