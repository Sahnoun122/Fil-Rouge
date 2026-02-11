'use client';

// components/ProtectedRoute.tsx - Composant pour protéger les routes

import { useAuth } from '../hooks/useAuth';
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
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

    // Vérifier le rôle admin
    if (requireAdmin && user?.role !== 'admin') {
      router.push('/dashboard'); // Rediriger vers dashboard si pas admin
      return;
    }

  }, [isAuthenticated, isLoading, user, requireAuth, requireAdmin, redirectTo, router]);

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