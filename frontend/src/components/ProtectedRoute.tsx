'use client';

// components/ProtectedRoute.tsx - Composant pour protéger les routes

import { useAuth } from '../hooks/useAuth';
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { isAuthorizedForRoute, getDashboardUrl, UserRole } from '../utils/roleRedirect';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoading) return;

    // Vérifier l'authentification
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Vérifier l'autorisation par rôle
    if (requireAuth && !isAuthorizedForRoute(user, requiredRole)) {
      // Rediriger vers le dashboard approprié selon le rôle actuel
      const fallbackUrl = user ? getDashboardUrl(user.role as UserRole) : '/login';
      router.push(fallbackUrl);
      return;
    }

  }, [isAuthenticated, isLoading, user, requireAuth, requiredRole, redirectTo, router]);

  // Afficher un loading pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ne pas rendre si pas autorisé
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}