'use client';

import Link from 'next/link';
import {
  FormEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import useAdminUsers from '@/src/hooks/useAdmin';
import { AdminUser, AdminUserRole } from '@/src/types/admin.types';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 30];

const formatDate = (value?: string) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return DATE_FORMATTER.format(date);
};

const normalizeOptional = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getUserInitials = (fullName?: string) => {
  const normalized = (fullName ?? '').trim();
  if (!normalized) return 'U';

  return normalized
    .split(/\s+/)
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
  } = useAdminUsers({ page: 1, limit: DEFAULT_PAGE_SIZE });

  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'all'>('all');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>(EMPTY_FORM);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const deferredSearch = useDeferredValue(searchInput);

  const totalPages = usersResult?.totalPages ?? 1;
  const currentPage = usersResult?.page ?? 1;
  const totalUsers = usersResult?.total ?? 0;

  const isEditing = editingUserId !== null;
  const isAnyUserActionPending = isMutatingUser;
  const hasActiveFilters =
    roleFilter !== 'all' || searchInput.trim().length > 0;

  const loadCurrentListing = useCallback(
    async (overrides?: { page?: number }) => {
      await loadUsers({
        page: overrides?.page ?? currentPage,
        limit: pageSize,
        search: deferredSearch.trim(),
        role: roleFilter,
      });
    },
    [currentPage, deferredSearch, loadUsers, pageSize, roleFilter],
  );

  useEffect(() => {
    void loadStats().catch(() => undefined);
  }, [loadStats]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadUsers({
        page: 1,
        limit: pageSize,
        search: deferredSearch.trim(),
        role: roleFilter,
      }).catch(() => undefined);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [deferredSearch, pageSize, roleFilter, loadUsers]);

  const statsCards = useMemo(() => {
    if (!stats) {
      return [
        { label: 'Total accounts', value: '-', note: '-' },
        { label: 'Admins', value: '-', note: '-' },
        { label: 'Banned', value: '-', note: '-' },
        { label: 'Recent (30d)', value: '-', note: '-' },
      ];
    }

    const active = Math.max(stats.total - stats.banned, 0);
    const adminRatio =
      stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0;

    return [
      {
        label: 'Total accounts',
        value: String(stats.total),
        note: `${active} active`,
      },
      {
        label: 'Admins',
        value: String(stats.admins),
        note: `${adminRatio}% of total`,
      },
      {
        label: 'Banned',
        value: String(stats.banned),
        note: `${Math.max(stats.total - stats.banned, 0)} available`,
      },
      {
        label: 'Recent (30d)',
        value: String(stats.recentSignups),
        note: 'new signups',
      },
    ];
  }, [stats]);

  const pageStart = useMemo(() => {
    if (totalUsers === 0) return 0;
    return (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize, totalUsers]);

  const pageEnd = useMemo(() => {
    if (totalUsers === 0) return 0;
    return Math.min(currentPage * pageSize, totalUsers);
  }, [currentPage, pageSize, totalUsers]);

  const onPageChange = useCallback(
    async (page: number) => {
      if (page < 1 || page > totalPages || isLoadingUsers) return;

      try {
        await loadUsers({
          page,
          limit: pageSize,
          search: deferredSearch.trim(),
          role: roleFilter,
        });
      } catch {
        // handled by hook state
      }
    },
    [
      deferredSearch,
      isLoadingUsers,
      loadUsers,
      pageSize,
      roleFilter,
      totalPages,
    ],
  );

  const onRoleChange = useCallback(
    async (targetUserId: string, role: AdminUserRole) => {
      setPendingUserId(targetUserId);

      try {
        await updateUserRole(targetUserId, role);
        await loadStats();
      } catch {
        // handled by hook state
      } finally {
        setPendingUserId(null);
      }
    },
    [loadStats, updateUserRole],
  );

  const resetForm = useCallback(() => {
    setFormState(EMPTY_FORM);
    setEditingUserId(null);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    resetForm();
  }, [resetForm]);

  const openCreateForm = useCallback(() => {
    resetForm();
    setIsFormOpen(true);
  }, [resetForm]);

  const openEditForm = useCallback((managedUser: AdminUser) => {
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
  }, []);

  const onFormFieldChange = useCallback(
    <K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const onSubmitUserForm = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const fullName = formState.fullName.trim();
      const email = formState.email.trim().toLowerCase();
      const password = formState.password.trim();

      if (!fullName || !email) return;
      if (!isEditing && !password) return;

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
        await Promise.all([loadCurrentListing({ page: 1 }), loadStats()]);
      } catch {
        // handled by hook state
      } finally {
        setIsSubmittingForm(false);
      }
    },
    [
      closeForm,
      createUser,
      editingUserId,
      formState.companyName,
      formState.email,
      formState.fullName,
      formState.industry,
      formState.password,
      formState.phone,
      formState.role,
      isEditing,
      loadCurrentListing,
      loadStats,
      updateUser,
    ],
  );

  const onDeleteUser = useCallback(
    async (targetUser: AdminUser) => {
      const confirmed = window.confirm(
        `Delete account for "${targetUser.fullName}"? This action is irreversible.`,
      );
      if (!confirmed) return;

      setPendingUserId(targetUser.id);

      try {
        await deleteUser(targetUser.id);
        const nextPage =
          users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

        await Promise.all([
          loadUsers({
            page: nextPage,
            limit: pageSize,
            search: deferredSearch.trim(),
            role: roleFilter,
          }),
          loadStats(),
        ]);
      } catch {
        // handled by hook state
      } finally {
        setPendingUserId(null);
      }
    },
    [
      currentPage,
      deferredSearch,
      deleteUser,
      loadStats,
      loadUsers,
      pageSize,
      roleFilter,
      users.length,
    ],
  );

  const onToggleBan = useCallback(
    async (targetUser: AdminUser) => {
      setPendingUserId(targetUser.id);

      try {
        const reason = targetUser.isBanned
          ? undefined
          : 'Banned by administrator action';
        await setUserBanStatus(targetUser.id, !targetUser.isBanned, reason);
        await loadStats();
      } catch {
        // handled by hook state
      } finally {
        setPendingUserId(null);
      }
    },
    [loadStats, setUserBanStatus],
  );

  return (
    <section className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-emerald-200/30 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
              Admin workspace
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Users command center
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
              Moderate roles, monitor account status, and keep access clean.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void Promise.all([loadCurrentListing(), loadStats()])}
              className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
              type="button"
            >
              Refresh
            </button>
            <button
              onClick={openCreateForm}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="button"
            >
              New user
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {isLoadingStats ? '...' : card.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_0.8fr_auto_auto]">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="name, email, company"
              className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              type="text"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </span>
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as AdminUserRole | 'all')
              }
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Per page
            </span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => void loadCurrentListing({ page: 1 })}
            className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
          >
            Apply
          </button>

          <button
            onClick={() => {
              setSearchInput('');
              setRoleFilter('all');
              setPageSize(DEFAULT_PAGE_SIZE);
            }}
            disabled={!hasActiveFilters}
            className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            Reset
          </button>
        </div>

        {isFormOpen ? (
          <form
            onSubmit={onSubmitUserForm}
            className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {isEditing ? 'Edit user' : 'Create user'}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full name
                </span>
                <input
                  value={formState.fullName}
                  onChange={(event) =>
                    onFormFieldChange('fullName', event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  type="text"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </span>
                <input
                  value={formState.email}
                  onChange={(event) =>
                    onFormFieldChange('email', event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  type="email"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Password {isEditing ? '(optional)' : ''}
                </span>
                <input
                  value={formState.password}
                  onChange={(event) =>
                    onFormFieldChange('password', event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  type="password"
                  required={!isEditing}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </span>
                <input
                  value={formState.phone}
                  onChange={(event) =>
                    onFormFieldChange('phone', event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company
                </span>
                <input
                  value={formState.companyName}
                  onChange={(event) =>
                    onFormFieldChange('companyName', event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Industry
                </span>
                <input
                  value={formState.industry}
                  onChange={(event) =>
                    onFormFieldChange('industry', event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </span>
                <select
                  value={formState.role}
                  onChange={(event) =>
                    onFormFieldChange(
                      'role',
                      event.target.value as AdminUserRole,
                    )
                  }
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
                Cancel
              </button>
              <button
                disabled={isSubmittingForm}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
              >
                {isSubmittingForm ? 'Saving...' : isEditing ? 'Update' : 'Create'}
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
              Close
            </button>
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Last login</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Created</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoadingUsers ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      No users match the current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((managedUser) => {
                    const isCurrentAdmin = managedUser.id === currentUser?.id;
                    const isPending = pendingUserId === managedUser.id;
                    const disableActions =
                      isPending || isAnyUserActionPending || isCurrentAdmin;

                    return (
                      <tr key={managedUser.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                              {getUserInitials(managedUser.fullName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {managedUser.fullName || '-'}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {managedUser.email}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {managedUser.companyName || 'No company'} |{' '}
                                {managedUser.industry || 'No industry'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={managedUser.role}
                            onChange={(event) =>
                              void onRoleChange(
                                managedUser.id,
                                event.target.value as AdminUserRole,
                              )
                            }
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
                            {managedUser.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(managedUser.lastLoginAt)}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(managedUser.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/users/${managedUser.id}`}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              View
                            </Link>

                            {isCurrentAdmin ? (
                              <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                                Current account
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => openEditForm(managedUser)}
                                  disabled={disableActions}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  type="button"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => void onToggleBan(managedUser)}
                                  disabled={disableActions}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    managedUser.isBanned
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                  type="button"
                                >
                                  {managedUser.isBanned ? 'Unban' : 'Ban'}
                                </button>

                                <button
                                  onClick={() => void onDeleteUser(managedUser)}
                                  disabled={disableActions}
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  type="button"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
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
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {pageStart}-{pageEnd}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">{totalUsers}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingUsers}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => void onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingUsers}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}
