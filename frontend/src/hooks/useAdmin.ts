'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import AdminService from '../services/adminService';
import {
  AdminUser,
  AdminUserRole,
  AdminUserStats,
  AdminUsersFilters,
  AdminUsersResult,
} from '../types/admin.types';

const DEFAULT_FILTERS: Required<AdminUsersFilters> = {
  page: 1,
  limit: 10,
  search: '',
  role: 'all',
  status: 'all',
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export function useAdminUsers(initialFilters?: AdminUsersFilters) {
  const initialResolvedFilters: Required<AdminUsersFilters> = {
    ...DEFAULT_FILTERS,
    ...initialFilters,
    page: initialFilters?.page ?? DEFAULT_FILTERS.page,
    limit: initialFilters?.limit ?? DEFAULT_FILTERS.limit,
    search: initialFilters?.search ?? DEFAULT_FILTERS.search,
    role: initialFilters?.role ?? DEFAULT_FILTERS.role,
    status: initialFilters?.status ?? DEFAULT_FILTERS.status,
  };

  const [filters, setFiltersState] = useState<Required<AdminUsersFilters>>(initialResolvedFilters);
  const filtersRef = useRef<Required<AdminUsersFilters>>(initialResolvedFilters);

  const [usersResult, setUsersResult] = useState<AdminUsersResult | null>(null);
  const [stats, setStats] = useState<AdminUserStats | null>(null);

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isMutatingUser, setIsMutatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback((nextFilters: Required<AdminUsersFilters>) => {
    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
  }, []);

  const loadUsers = useCallback(async (overrides?: Partial<AdminUsersFilters>) => {
    const currentFilters = filtersRef.current;
    const nextFilters: Required<AdminUsersFilters> = {
      ...currentFilters,
      ...overrides,
      page: overrides?.page ?? currentFilters.page,
      limit: overrides?.limit ?? currentFilters.limit,
      search: overrides?.search ?? currentFilters.search,
      role: overrides?.role ?? currentFilters.role,
      status: overrides?.status ?? currentFilters.status,
    };

    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
    setIsLoadingUsers(true);
    setError(null);

    try {
      const data = await AdminService.getUsers(nextFilters);
      setUsersResult(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement des utilisateurs');
      setError(message);
      throw err;
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    setError(null);

    try {
      const data = await AdminService.getStats();
      setStats(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement des statistiques');
      setError(message);
      throw err;
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const updateCachedUser = useCallback((updated: AdminUser) => {
    setUsersResult((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        users: prev.users.map((user) => (user.id === updated.id ? updated : user)),
      };
    });
  }, []);

  const toggleUserStatus = useCallback(async (userId: string) => {
    setIsMutatingUser(true);
    setError(null);

    try {
      const updated = await AdminService.toggleUserStatus(userId);
      updateCachedUser(updated);
      return updated;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors du changement de statut');
      setError(message);
      throw err;
    } finally {
      setIsMutatingUser(false);
    }
  }, [updateCachedUser]);

  const updateUserRole = useCallback(async (userId: string, role: AdminUserRole) => {
    setIsMutatingUser(true);
    setError(null);

    try {
      const updated = await AdminService.updateUserRole(userId, role);
      updateCachedUser(updated);
      return updated;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors du changement de role');
      setError(message);
      throw err;
    } finally {
      setIsMutatingUser(false);
    }
  }, [updateCachedUser]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadUsers(), loadStats()]);
  }, [loadUsers, loadStats]);

  const users = useMemo(() => usersResult?.users ?? [], [usersResult]);

  return {
    filters,
    setFilters,
    users,
    usersResult,
    stats,
    error,
    isLoadingUsers,
    isLoadingStats,
    isMutatingUser,
    loadUsers,
    loadStats,
    refreshAll,
    toggleUserStatus,
    updateUserRole,
    clearError: () => setError(null),
  };
}

export default useAdminUsers;
