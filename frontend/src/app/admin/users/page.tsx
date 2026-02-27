'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import useAdminUsers from '@/src/hooks/useAdmin';
import { SimpleToast } from '@/src/components/ui/SimpleToast';
import { AdminUserRole, AdminUserStatusFilter } from '@/src/types/admin.types';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return DATE_FORMATTER.format(date);
};

type ToastState = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const {
    users,
    usersResult,
    stats,
    error,
    isLoadingUsers,
    isLoadingStats,
    isMutatingUser,
    loadUsers,
    loadStats,
    toggleUserStatus,
    updateUserRole,
    clearError,
  } = useAdminUsers({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('all');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    loadStats().catch(() => undefined);
  }, [loadStats]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers({
        page: 1,
        limit: 10,
        search: searchInput,
        role: roleFilter,
        status: statusFilter,
      }).catch(() => undefined);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput, roleFilter, statusFilter, loadUsers]);

  const isAnyUserActionPending = isMutatingUser && pendingUserId !== null;

  const totalPages = usersResult?.totalPages ?? 1;
  const currentPage = usersResult?.page ?? 1;

  const statsCards = useMemo(() => {
    if (!stats) {
      return [
        { label: 'Total comptes', value: '-' },
        { label: 'Comptes actifs', value: '-' },
        { label: 'Comptes inactifs', value: '-' },
        { label: 'Administrateurs', value: '-' },
        { label: 'Emails verifies', value: '-' },
        { label: 'Nouveaux (30j)', value: '-' },
      ];
    }

    return [
      { label: 'Total comptes', value: String(stats.total) },
      { label: 'Comptes actifs', value: String(stats.active) },
      { label: 'Comptes inactifs', value: String(stats.inactive) },
      { label: 'Administrateurs', value: String(stats.admins) },
      { label: 'Emails verifies', value: String(stats.emailVerified) },
      { label: 'Nouveaux (30j)', value: String(stats.recentSignups) },
    ];
  }, [stats]);

  const onPageChange = async (page: number) => {
    if (page < 1 || page > totalPages || isLoadingUsers) {
      return;
    }

    try {
      await loadUsers({
        page,
        limit: 10,
        search: searchInput,
        role: roleFilter,
        status: statusFilter,
      });
    } catch {
      // handled by hook state
    }
  };

  const onRoleChange = async (targetUserId: string, role: AdminUserRole) => {
    setPendingUserId(targetUserId);

    try {
      await updateUserRole(targetUserId, role);
      setToast({ type: 'success', message: 'Role utilisateur mis a jour.' });
      await loadStats();
    } catch (err: unknown) {
      setToast({ type: 'error', message: getErrorMessage(err, 'Erreur lors de la mise a jour du role.') });
    } finally {
      setPendingUserId(null);
    }
  };

  const onToggleStatus = async (targetUserId: string) => {
    setPendingUserId(targetUserId);

    try {
      await toggleUserStatus(targetUserId);
      setToast({ type: 'success', message: 'Statut utilisateur mis a jour.' });
      await loadStats();
    } catch (err: unknown) {
      setToast({ type: 'error', message: getErrorMessage(err, 'Erreur lors du changement de statut.') });
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section className="space-y-6">
      {toast ? (
        <SimpleToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Administration</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestion des comptes utilisateurs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pilotez les roles et les activations des comptes depuis un espace centralise et securise.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statsCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {isLoadingStats ? '...' : card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recherche</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nom, email, entreprise"
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              type="text"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as AdminUserRole | 'all')}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            >
              <option value="all">Tous</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AdminUserStatusFilter)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            >
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </label>
        </div>

        {error ? (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              type="button"
            >
              Fermer
            </button>
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Nom</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Statut</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Verification</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Derniere connexion</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Cree le</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoadingUsers ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      Chargement des utilisateurs...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      Aucun utilisateur trouve pour ces filtres.
                    </td>
                  </tr>
                ) : (
                  users.map((managedUser) => {
                    const isCurrentAdmin = managedUser.id === currentUser?.id;
                    const isPending = pendingUserId === managedUser.id;
                    const disableActions = isPending || isAnyUserActionPending || isCurrentAdmin;

                    return (
                      <tr key={managedUser.id} className="align-middle">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{managedUser.fullName || '-'}</p>
                          <p className="text-xs text-slate-500">{managedUser.companyName || 'Sans entreprise'}</p>
                        </td>

                        <td className="px-4 py-3 text-slate-700">{managedUser.email}</td>

                        <td className="px-4 py-3">
                          <select
                            value={managedUser.role}
                            onChange={(event) => onRoleChange(managedUser.id, event.target.value as AdminUserRole)}
                            disabled={disableActions}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              managedUser.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {managedUser.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              managedUser.emailVerified
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {managedUser.emailVerified ? 'Verifie' : 'Non verifie'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">{formatDate(managedUser.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(managedUser.createdAt)}</td>

                        <td className="px-4 py-3">
                          {isCurrentAdmin ? (
                            <span className="text-xs font-semibold text-slate-400">Compte connecte</span>
                          ) : (
                            <button
                              onClick={() => onToggleStatus(managedUser.id)}
                              disabled={disableActions}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                managedUser.isActive
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                              type="button"
                            >
                              {managedUser.isActive ? 'Desactiver' : 'Activer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{usersResult?.total ?? 0}</span> comptes
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingUsers}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Precedent
            </button>

            <span className="text-sm text-slate-600">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingUsers}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Suivant
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}
