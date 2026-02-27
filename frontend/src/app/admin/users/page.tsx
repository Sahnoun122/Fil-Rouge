'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import useAdminUsers from '@/src/hooks/useAdmin';
import { AdminUser, AdminUserRole } from '@/src/types/admin.types';

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

const normalizeOptional = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

type UserFormState = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  industry: string;
  role: AdminUserRole;
};

const EMPTY_FORM: UserFormState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  companyName: '',
  industry: '',
  role: 'user',
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
    updateUserRole,
    createUser,
    updateUser,
    deleteUser,
    setUserBanStatus,
    clearError,
  } = useAdminUsers({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'all'>('all');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>(EMPTY_FORM);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

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
      }).catch(() => undefined);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput, roleFilter, loadUsers]);

  const isAnyUserActionPending = isMutatingUser && pendingUserId !== null;
  const isEditing = editingUserId !== null;

  const totalPages = usersResult?.totalPages ?? 1;
  const currentPage = usersResult?.page ?? 1;

  const statsCards = useMemo(() => {
    if (!stats) {
      return [
        { label: 'Total comptes', value: '-' },
        { label: 'Administrateurs', value: '-' },
        { label: 'Comptes bannis', value: '-' },
        { label: 'Nouveaux (30j)', value: '-' },
      ];
    }

    return [
      { label: 'Total comptes', value: String(stats.total) },
      { label: 'Administrateurs', value: String(stats.admins) },
      { label: 'Comptes bannis', value: String(stats.banned) },
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
      });
    } catch {
      // handled by hook state
    }
  };

  const onRoleChange = async (targetUserId: string, role: AdminUserRole) => {
    setPendingUserId(targetUserId);

    try {
      await updateUserRole(targetUserId, role);
      await loadStats();
    } catch {
      // handled by hook state
    } finally {
      setPendingUserId(null);
    }
  };

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setEditingUserId(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (managedUser: AdminUser) => {
    setEditingUserId(managedUser.id);
    setFormState({
      fullName: managedUser.fullName || '',
      email: managedUser.email || '',
      password: '',
      phone: managedUser.phone || '',
      companyName: managedUser.companyName || '',
      industry: managedUser.industry || '',
      role: managedUser.role,
    });
    setIsFormOpen(true);
  };

  const onFormFieldChange = <K extends keyof UserFormState,>(field: K, value: UserFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmitUserForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = formState.fullName.trim();
    const email = formState.email.trim().toLowerCase();
    const password = formState.password.trim();

    if (!fullName || !email) {
      return;
    }

    if (!isEditing && !password) {
      return;
    }

    setIsSubmittingForm(true);

    try {
      const payload = {
        fullName,
        email,
        phone: normalizeOptional(formState.phone),
        companyName: normalizeOptional(formState.companyName),
        industry: normalizeOptional(formState.industry),
        role: formState.role,
        ...(password ? { password } : {}),
      };

      if (isEditing && editingUserId) {
        await updateUser(editingUserId, payload);
      } else {
        await createUser({ ...payload, password });
      }

      closeForm();

      await loadUsers({
        page: isEditing ? currentPage : 1,
        limit: 10,
        search: searchInput,
        role: roleFilter,
      });
      await loadStats();
    } catch {
      // handled by hook state
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const onDeleteUser = async (targetUserId: string) => {
    setPendingUserId(targetUserId);

    try {
      await deleteUser(targetUserId);

      const nextPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadUsers({
        page: nextPage,
        limit: 10,
        search: searchInput,
        role: roleFilter,
      });
      await loadStats();
    } catch {
      // handled by hook state
    } finally {
      setPendingUserId(null);
    }
  };

  const onToggleBan = async (targetUser: AdminUser) => {
    setPendingUserId(targetUser.id);

    try {
      const reason = targetUser.isBanned ? undefined : 'Banni par un administrateur';
      await setUserBanStatus(targetUser.id, !targetUser.isBanned, reason);
      await loadStats();
    } catch {
      // handled by hook state
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Administration</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestion des comptes utilisateurs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pilotez la gestion des comptes depuis un espace centralise et securise.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoadingStats ? '...' : card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[1.5fr_1fr]">
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
          </div>

          <button
            onClick={openCreateForm}
            className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
          >
            Nouvel utilisateur
          </button>
        </div>

        {isFormOpen ? (
          <form onSubmit={onSubmitUserForm} className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">{isEditing ? 'Modifier un utilisateur' : 'Creer un utilisateur'}</h2>
              <button
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                type="button"
              >
                Fermer
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nom complet</span>
                <input
                  value={formState.fullName}
                  onChange={(event) => onFormFieldChange('fullName', event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  type="text"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                <input
                  value={formState.email}
                  onChange={(event) => onFormFieldChange('email', event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  type="email"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mot de passe {isEditing ? '(optionnel)' : ''}
                </span>
                <input
                  value={formState.password}
                  onChange={(event) => onFormFieldChange('password', event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  type="password"
                  required={!isEditing}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telephone</span>
                <input
                  value={formState.phone}
                  onChange={(event) => onFormFieldChange('phone', event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entreprise</span>
                <input
                  value={formState.companyName}
                  onChange={(event) => onFormFieldChange('companyName', event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secteur</span>
                <input
                  value={formState.industry}
                  onChange={(event) => onFormFieldChange('industry', event.target.value)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
                <select
                  value={formState.role}
                  onChange={(event) => onFormFieldChange('role', event.target.value as AdminUserRole)}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                type="button"
              >
                Annuler
              </button>
              <button
                disabled={isSubmittingForm}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
              >
                {isSubmittingForm ? 'Sauvegarde...' : isEditing ? 'Mettre a jour' : 'Creer'}
              </button>
            </div>
          </form>
        ) : null}

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
                  <th className="px-4 py-3 font-semibold text-slate-600">Derniere connexion</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Cree le</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoadingUsers ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      Chargement des utilisateurs...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
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
                              managedUser.isBanned
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {managedUser.isBanned ? 'Banni' : 'Normal'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">{formatDate(managedUser.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(managedUser.createdAt)}</td>

                        <td className="px-4 py-3">
                          {isCurrentAdmin ? (
                            <span className="text-xs font-semibold text-slate-400">Compte connecte</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => openEditForm(managedUser)}
                                disabled={disableActions}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                type="button"
                              >
                                Modifier
                              </button>

                              <button
                                onClick={() => onDeleteUser(managedUser.id)}
                                disabled={disableActions}
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                type="button"
                              >
                                Supprimer
                              </button>

                              <button
                                onClick={() => onToggleBan(managedUser)}
                                disabled={disableActions}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  managedUser.isBanned
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                                type="button"
                              >
                                {managedUser.isBanned ? 'Debannir' : 'Bannir'}
                              </button>
                            </div>
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
