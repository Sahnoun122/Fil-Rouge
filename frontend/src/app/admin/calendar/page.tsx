'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock3,
  Search,
  Users,
} from 'lucide-react';
import { useAdminUsers } from '@/src/hooks/useAdmin';

export default function AdminCalendarPage() {
  const {
    users,
    error,
    isLoadingUsers,
    loadUsers,
  } = useAdminUsers({
    page: 1,
    limit: 24,
    search: '',
    role: 'all',
  });

  useEffect(() => {
    loadUsers().catch(() => undefined);
  }, [loadUsers]);

  if (isLoadingUsers && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Chargement du hub calendrier admin...
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Calendrier admin indisponible</h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            Retour dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin calendar
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Calendriers des utilisateurs
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Hub central pour consulter les plannings de chaque utilisateur
                de maniere propre, avec acces direct a leur calendrier detaille.
              </p>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Utilisateurs
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {users.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Acces
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  Admin
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              Acces par utilisateur
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {user.fullName || 'Utilisateur'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.isBanned
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.isBanned ? 'Banni' : 'Actif'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {user.companyName || 'Entreprise non renseignee'}
                  </p>
                  <p className="flex items-center">
                    <Clock3 className="mr-2 h-4 w-4" />
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                  <p className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    {user.industry || 'Secteur non renseigne'}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/users/${user.id}/calendar`}
                    className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Voir calendrier
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Voir profil
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
