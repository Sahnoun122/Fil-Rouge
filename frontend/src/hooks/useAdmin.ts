'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import AdminService from '../services/adminService';
import {
  AdminCreateUserPayload,
  AdminStrategiesFilters,
  AdminStrategyDetail,
  AdminStrategiesResult,
  AdminStrategy,
  AdminSwotDetail,
  AdminSwotFilters,
  AdminSwotsResult,
  AdminSwot,
  AdminUser,
  AdminUserRole,
  AdminUserStats,
  AdminUsersFilters,
  AdminUsersResult,
  AdminUpdateUserPayload,
} from '../types/admin.types';

const DEFAULT_FILTERS: Required<AdminUsersFilters> = {
  page: 1,
  limit: 10,
  search: '',
  role: 'all',
};

const DEFAULT_STRATEGIES_FILTERS: Required<AdminStrategiesFilters> = {
  page: 1,
  limit: 10,
  search: '',
};

const DEFAULT_SWOTS_FILTERS: Required<AdminSwotFilters> = {
  page: 1,
  limit: 10,
  search: '',
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

  const addCachedUser = useCallback((created: AdminUser) => {
    setUsersResult((prev) => {
      if (!prev) {
        return prev;
      }

      const nextTotal = prev.total + 1;
      const nextUsers = [created, ...prev.users].slice(0, prev.limit);

      return {
        ...prev,
        users: nextUsers,
        total: nextTotal,
        totalPages: Math.max(1, Math.ceil(nextTotal / prev.limit)),
      };
    });
  }, []);

  const removeCachedUser = useCallback((userId: string) => {
    setUsersResult((prev) => {
      if (!prev) {
        return prev;
      }

      const nextUsers = prev.users.filter((user) => user.id !== userId);
      const hasRemoved = nextUsers.length !== prev.users.length;
      if (!hasRemoved) {
        return prev;
      }

      const nextTotal = Math.max(0, prev.total - 1);

      return {
        ...prev,
        users: nextUsers,
        total: nextTotal,
        totalPages: Math.max(1, Math.ceil(nextTotal / prev.limit)),
      };
    });
  }, []);

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

  const createUser = useCallback(async (payload: AdminCreateUserPayload) => {
    setIsMutatingUser(true);
    setError(null);

    try {
      const created = await AdminService.createUser(payload);
      addCachedUser(created);
      return created;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors de la creation utilisateur');
      setError(message);
      throw err;
    } finally {
      setIsMutatingUser(false);
    }
  }, [addCachedUser]);

  const updateUser = useCallback(async (userId: string, payload: AdminUpdateUserPayload) => {
    setIsMutatingUser(true);
    setError(null);

    try {
      const updated = await AdminService.updateUser(userId, payload);
      updateCachedUser(updated);
      return updated;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors de la mise a jour utilisateur');
      setError(message);
      throw err;
    } finally {
      setIsMutatingUser(false);
    }
  }, [updateCachedUser]);

  const deleteUser = useCallback(async (userId: string) => {
    setIsMutatingUser(true);
    setError(null);

    try {
      await AdminService.deleteUser(userId);
      removeCachedUser(userId);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors de la suppression utilisateur');
      setError(message);
      throw err;
    } finally {
      setIsMutatingUser(false);
    }
  }, [removeCachedUser]);

  const setUserBanStatus = useCallback(async (userId: string, ban: boolean, reason?: string) => {
    setIsMutatingUser(true);
    setError(null);

    try {
      const updated = await AdminService.setUserBanStatus(userId, { ban, reason });
      updateCachedUser(updated);
      return updated;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur lors du changement de statut de bannissement');
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
    updateUserRole,
    createUser,
    updateUser,
    deleteUser,
    setUserBanStatus,
    clearError: () => setError(null),
  };
}

export function useAdminUser() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (userId: string) => {
    setIsLoadingUser(true);
    setError(null);

    try {
      const data = await AdminService.getUserById(userId);
      setUser(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement utilisateur');
      setError(message);
      throw err;
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  return {
    user,
    error,
    isLoadingUser,
    loadUser,
    clearError: () => setError(null),
  };
}

export function useAdminStrategies(initialFilters?: AdminStrategiesFilters) {
  const initialResolvedFilters: Required<AdminStrategiesFilters> = {
    ...DEFAULT_STRATEGIES_FILTERS,
    ...initialFilters,
    page: initialFilters?.page ?? DEFAULT_STRATEGIES_FILTERS.page,
    limit: initialFilters?.limit ?? DEFAULT_STRATEGIES_FILTERS.limit,
    search: initialFilters?.search ?? DEFAULT_STRATEGIES_FILTERS.search,
  };

  const [filters, setFiltersState] = useState<Required<AdminStrategiesFilters>>(initialResolvedFilters);
  const filtersRef = useRef<Required<AdminStrategiesFilters>>(initialResolvedFilters);
  const [strategiesResult, setStrategiesResult] = useState<AdminStrategiesResult | null>(null);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback((nextFilters: Required<AdminStrategiesFilters>) => {
    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
  }, []);

  const loadStrategies = useCallback(async (overrides?: Partial<AdminStrategiesFilters>) => {
    const currentFilters = filtersRef.current;
    const nextFilters: Required<AdminStrategiesFilters> = {
      ...currentFilters,
      ...overrides,
      page: overrides?.page ?? currentFilters.page,
      limit: overrides?.limit ?? currentFilters.limit,
      search: overrides?.search ?? currentFilters.search,
    };

    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
    setIsLoadingStrategies(true);
    setError(null);

    try {
      const data = await AdminService.getStrategies(nextFilters);
      setStrategiesResult(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement des strategies');
      setError(message);
      throw err;
    } finally {
      setIsLoadingStrategies(false);
    }
  }, []);

  const strategies = useMemo<AdminStrategy[]>(
    () => strategiesResult?.strategies ?? [],
    [strategiesResult],
  );

  return {
    filters,
    setFilters,
    strategies,
    strategiesResult,
    error,
    isLoadingStrategies,
    loadStrategies,
    clearError: () => setError(null),
  };
}

export function useAdminStrategy() {
  const [strategy, setStrategy] = useState<AdminStrategyDetail | null>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStrategy = useCallback(async (strategyId: string) => {
    setIsLoadingStrategy(true);
    setError(null);

    try {
      const data = await AdminService.getStrategyById(strategyId);
      setStrategy(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement de la strategie');
      setError(message);
      throw err;
    } finally {
      setIsLoadingStrategy(false);
    }
  }, []);

  return {
    strategy,
    error,
    isLoadingStrategy,
    loadStrategy,
    clearError: () => setError(null),
  };
}

export function useAdminSwots(initialFilters?: AdminSwotFilters) {
  const initialResolvedFilters: Required<AdminSwotFilters> = {
    ...DEFAULT_SWOTS_FILTERS,
    ...initialFilters,
    page: initialFilters?.page ?? DEFAULT_SWOTS_FILTERS.page,
    limit: initialFilters?.limit ?? DEFAULT_SWOTS_FILTERS.limit,
    search: initialFilters?.search ?? DEFAULT_SWOTS_FILTERS.search,
  };

  const [filters, setFiltersState] = useState<Required<AdminSwotFilters>>(initialResolvedFilters);
  const filtersRef = useRef<Required<AdminSwotFilters>>(initialResolvedFilters);
  const [swotsResult, setSwotsResult] = useState<AdminSwotsResult | null>(null);
  const [isLoadingSwots, setIsLoadingSwots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback((nextFilters: Required<AdminSwotFilters>) => {
    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
  }, []);

  const loadSwots = useCallback(async (overrides?: Partial<AdminSwotFilters>) => {
    const currentFilters = filtersRef.current;
    const nextFilters: Required<AdminSwotFilters> = {
      ...currentFilters,
      ...overrides,
      page: overrides?.page ?? currentFilters.page,
      limit: overrides?.limit ?? currentFilters.limit,
      search: overrides?.search ?? currentFilters.search,
    };

    filtersRef.current = nextFilters;
    setFiltersState(nextFilters);
    setIsLoadingSwots(true);
    setError(null);

    try {
      const data = await AdminService.getSwots(nextFilters);
      setSwotsResult(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement des SWOT');
      setError(message);
      throw err;
    } finally {
      setIsLoadingSwots(false);
    }
  }, []);

  const swots = useMemo<AdminSwot[]>(
    () => swotsResult?.swots ?? [],
    [swotsResult],
  );

  return {
    filters,
    setFilters,
    swots,
    swotsResult,
    error,
    isLoadingSwots,
    loadSwots,
    clearError: () => setError(null),
  };
}

export function useAdminSwot() {
  const [swot, setSwot] = useState<AdminSwotDetail | null>(null);
  const [isLoadingSwot, setIsLoadingSwot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSwot = useCallback(async (swotId: string) => {
    setIsLoadingSwot(true);
    setError(null);

    try {
      const data = await AdminService.getSwotById(swotId);
      setSwot(data);
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Erreur de chargement du SWOT');
      setError(message);
      throw err;
    } finally {
      setIsLoadingSwot(false);
    }
  }, []);

  return {
    swot,
    error,
    isLoadingSwot,
    loadSwot,
    clearError: () => setError(null),
  };
}

export default useAdminUsers;
