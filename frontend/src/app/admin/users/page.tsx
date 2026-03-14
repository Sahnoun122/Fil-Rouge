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
import {
  Users,
  Ban,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  X,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import useAdminUsers from '@/src/hooks/useAdmin';
import { AdminUser, AdminUserRole } from '@/src/types/admin.types';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
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
  return normalized.split(/\s+/).map((c) => c[0]).join('').slice(0, 2).toUpperCase();
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

const inputCls =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 placeholder:text-slate-400';

const selectCls =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

const labelCls = 'flex flex-col gap-1.5';
const labelTextCls = 'text-xs font-semibold text-slate-500 uppercase tracking-wide';

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
  const hasActiveFilters = roleFilter !== 'all' || searchInput.trim().length > 0;

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
    const id = setTimeout(() => {
      void loadUsers({ page: 1, limit: pageSize, search: deferredSearch.trim(), role: roleFilter }).catch(() => undefined);
    }, 250);
    return () => clearTimeout(id);
  }, [deferredSearch, pageSize, roleFilter, loadUsers]);

  const statsCards = useMemo(() => {
    if (!stats) return [
      { label: 'Total comptes', value: '-', sub: '-', icon: Users, accent: 'bg-violet-50 text-violet-600 border-violet-100' },
      { label: 'Bannis', value: '-', sub: '-', icon: Ban, accent: 'bg-orange-50 text-orange-600 border-orange-100' },
      { label: 'Nouveaux (30j)', value: '-', sub: '-', icon: TrendingUp, accent: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    ];
    const active = Math.max(stats.total - stats.banned, 0);
    return [
      { label: 'Total comptes', value: String(stats.total), sub: `${active} actifs`, icon: Users, accent: 'bg-violet-50 text-violet-600 border-violet-100' },
      { label: 'Bannis', value: String(stats.banned), sub: `${active} disponibles`, icon: Ban, accent: 'bg-orange-50 text-orange-600 border-orange-100' },
      { label: 'Nouveaux (30j)', value: String(stats.recentSignups), sub: 'nouvelles inscriptions', icon: TrendingUp, accent: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    ];
  }, [stats]);

  const pageStart = useMemo(() => totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1, [currentPage, pageSize, totalUsers]);
  const pageEnd = useMemo(() => totalUsers === 0 ? 0 : Math.min(currentPage * pageSize, totalUsers), [currentPage, pageSize, totalUsers]);

  const onPageChange = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages || isLoadingUsers) return;
    try { await loadUsers({ page, limit: pageSize, search: deferredSearch.trim(), role: roleFilter }); } catch { /* handled */ }
  }, [deferredSearch, isLoadingUsers, loadUsers, pageSize, roleFilter, totalPages]);

  const onRoleChange = useCallback(async (targetId: string, role: AdminUserRole) => {
    setPendingUserId(targetId);
    try { await updateUserRole(targetId, role); await loadStats(); } catch { /* handled */ } finally { setPendingUserId(null); }
  }, [loadStats, updateUserRole]);

  const resetForm = useCallback(() => { setFormState(EMPTY_FORM); setEditingUserId(null); }, []);
  const closeForm = useCallback(() => { setIsFormOpen(false); resetForm(); }, [resetForm]);
  const openCreateForm = useCallback(() => { resetForm(); setIsFormOpen(true); }, [resetForm]);

  const openEditForm = useCallback((u: AdminUser) => {
    setEditingUserId(u.id);
    setFormState({ fullName: u.fullName || '', email: u.email || '', password: '', phone: u.phone || '', companyName: u.companyName || '', industry: u.industry || '', role: u.role });
    setIsFormOpen(true);
  }, []);

  const onFormFieldChange = useCallback(<K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onSubmitUserForm = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullName = formState.fullName.trim();
    const email = formState.email.trim().toLowerCase();
    const password = formState.password.trim();
    if (!fullName || !email) return;
    if (!isEditing && !password) return;
    setIsSubmittingForm(true);
    try {
      const payload = { fullName, email, phone: normalizeOptional(formState.phone), companyName: normalizeOptional(formState.companyName), industry: normalizeOptional(formState.industry), role: formState.role, ...(password ? { password } : {}) };
      if (isEditing && editingUserId) { await updateUser(editingUserId, payload); } else { await createUser({ ...payload, password }); }
      closeForm();
      await Promise.all([loadCurrentListing({ page: 1 }), loadStats()]);
    } catch { /* handled */ } finally { setIsSubmittingForm(false); }
  }, [closeForm, createUser, editingUserId, formState, isEditing, loadCurrentListing, loadStats, updateUser]);

  const onDeleteUser = useCallback(async (u: AdminUser) => {
    if (!window.confirm(`Supprimer le compte de "${u.fullName}" ? Cette action est irréversible.`)) return;
    setPendingUserId(u.id);
    try {
      await deleteUser(u.id);
      const nextPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await Promise.all([loadUsers({ page: nextPage, limit: pageSize, search: deferredSearch.trim(), role: roleFilter }), loadStats()]);
    } catch { /* handled */ } finally { setPendingUserId(null); }
  }, [currentPage, deferredSearch, deleteUser, loadStats, loadUsers, pageSize, roleFilter, users.length]);

  const onToggleBan = useCallback(async (u: AdminUser) => {
    setPendingUserId(u.id);
    try { await setUserBanStatus(u.id, !u.isBanned, u.isBanned ? undefined : 'Banned by administrator action'); await loadStats(); }
    catch { /* handled */ } finally { setPendingUserId(null); }
  }, [loadStats, setUserBanStatus]);

  return (
    <section className="space-y-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-purple-200/25 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
              <UserCog className="w-3 h-3" />
              Gestion des utilisateurs
            </span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Users Command Center</h1>
            <p className="max-w-xl text-sm text-slate-500">
              Modérez les rôles, surveillez les statuts et gérez les accès en temps réel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void Promise.all([loadCurrentListing(), loadStats()])}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 active:scale-95"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </button>
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5 active:translate-y-0"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Nouvel utilisateur
            </button>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{isLoadingStats ? '…' : card.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
                </div>
                <div className={`rounded-xl border p-2.5 ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Main panel */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters bar */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_140px_auto_auto]">
            <label className={labelCls}>
              <span className={labelTextCls}>Recherche</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="nom, email, entreprise…"
                  className={`${inputCls} pl-9`}
                  type="text"
                />
              </div>
            </label>

            <label className={labelCls}>
              <span className={labelTextCls}>Rôle</span>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as AdminUserRole | 'all')} className={selectCls}>
                <option value="all">Tous les rôles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </label>

            <label className={labelCls}>
              <span className={labelTextCls}>Par page</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className={selectCls}>
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <div className="flex items-end">
              <button
                onClick={() => void loadCurrentListing({ page: 1 })}
                className="h-10 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                type="button"
              >
                Appliquer
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => { setSearchInput(''); setRoleFilter('all'); setPageSize(DEFAULT_PAGE_SIZE); }}
                disabled={!hasActiveFilters}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Create / Edit form */}
        {isFormOpen && (
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <form onSubmit={onSubmitUserForm} className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">
                  {isEditing ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
                </h2>
                <button onClick={closeForm} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700" type="button">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className={labelCls}>
                  <span className={labelTextCls}>Nom complet *</span>
                  <input value={formState.fullName} onChange={(e) => onFormFieldChange('fullName', e.target.value)} className={inputCls} type="text" required />
                </label>
                <label className={labelCls}>
                  <span className={labelTextCls}>Email *</span>
                  <input value={formState.email} onChange={(e) => onFormFieldChange('email', e.target.value)} className={inputCls} type="email" required />
                </label>
                <label className={labelCls}>
                  <span className={labelTextCls}>Mot de passe {isEditing ? '(optionnel)' : '*'}</span>
                  <input value={formState.password} onChange={(e) => onFormFieldChange('password', e.target.value)} className={inputCls} type="password" required={!isEditing} />
                </label>
                <label className={labelCls}>
                  <span className={labelTextCls}>Téléphone</span>
                  <input value={formState.phone} onChange={(e) => onFormFieldChange('phone', e.target.value)} className={inputCls} type="text" />
                </label>
                <label className={labelCls}>
                  <span className={labelTextCls}>Entreprise</span>
                  <input value={formState.companyName} onChange={(e) => onFormFieldChange('companyName', e.target.value)} className={inputCls} type="text" />
                </label>
                <label className={labelCls}>
                  <span className={labelTextCls}>Secteur</span>
                  <input value={formState.industry} onChange={(e) => onFormFieldChange('industry', e.target.value)} className={inputCls} type="text" />
                </label>
                <label className={labelCls}>
                  <span className={labelTextCls}>Rôle</span>
                  <select value={formState.role} onChange={(e) => onFormFieldChange('role', e.target.value as AdminUserRole)} className={selectCls}>
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button onClick={closeForm} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button">
                  Annuler
                </button>
                <button
                  disabled={isSubmittingForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                >
                  {isSubmittingForm ? 'Sauvegarde…' : isEditing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={clearError} className="rounded-md p-1 text-red-500 transition hover:bg-red-100" type="button">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Utilisateur</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Rôle</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                  <th className="hidden px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">Dernière connexion</th>
                  <th className="hidden px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">Inscrit le</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoadingUsers ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                            <div className="h-2.5 w-48 animate-pulse rounded bg-slate-100" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">Aucun utilisateur trouvé</p>
                        <p className="text-xs text-slate-400">Essayez de modifier vos filtres</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isCurrentAdmin = u.id === currentUser?.id;
                    const isPending = pendingUserId === u.id;
                    const disabled = isPending || isAnyUserActionPending || isCurrentAdmin;

                    return (
                      <tr key={u.id} className={`align-middle transition-colors hover:bg-slate-50/80 ${isPending ? 'opacity-60' : ''}`}>
                        {/* User cell */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm shadow-violet-500/20">
                              {getUserInitials(u.fullName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{u.fullName || '-'}</p>
                              <p className="truncate text-xs text-slate-500">{u.email}</p>
                              {(u.companyName || u.industry) && (
                                <p className="truncate text-xs text-slate-400">
                                  {[u.companyName, u.industry].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          {!isCurrentAdmin && (
                            <select
                              value={u.role}
                              onChange={(e) => void onRoleChange(u.id, e.target.value as AdminUserRole)}
                              disabled={isPending || isAnyUserActionPending}
                              className={`h-8 rounded-lg border px-2 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                u.role === 'admin'
                                  ? 'border-violet-200 bg-violet-50 text-violet-700 focus:border-violet-400 focus:ring-1 focus:ring-violet-100'
                                  : 'border-slate-200 bg-white text-slate-700 focus:border-violet-300 focus:ring-1 focus:ring-violet-100'
                              }`}
                            >
                              <option value="user">Utilisateur</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            u.isBanned
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {u.isBanned ? 'Banni' : 'Actif'}
                          </span>
                        </td>

                        {/* Last login */}
                        <td className="hidden px-4 py-3.5 text-xs text-slate-500 lg:table-cell">{formatDate(u.lastLoginAt)}</td>

                        {/* Created */}
                        <td className="hidden px-4 py-3.5 text-xs text-slate-500 md:table-cell">{formatDate(u.createdAt)}</td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/users/${u.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                              title="Voir le profil"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {isCurrentAdmin ? (
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-400">
                                Mon compte
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => openEditForm(u)}
                                  disabled={disabled}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Modifier"
                                  type="button"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => void onToggleBan(u)}
                                  disabled={disabled}
                                  className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    u.isBanned
                                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                                  type="button"
                                >
                                  {u.isBanned ? 'Débannir' : 'Bannir'}
                                </button>

                                <button
                                  onClick={() => void onDeleteUser(u)}
                                  disabled={disabled}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Supprimer"
                                  type="button"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Affichage{' '}
            <span className="font-semibold text-slate-800">{pageStart}–{pageEnd}</span>{' '}
            sur{' '}
            <span className="font-semibold text-slate-800">{totalUsers}</span> utilisateurs
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoadingUsers}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="min-w-[80px] text-center text-sm font-medium text-slate-600">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => void onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoadingUsers}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}
