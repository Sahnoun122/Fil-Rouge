'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock3,
  Search,
  Users,
  Building2,
  Briefcase,
  Layers,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react';
import { useAdminContents } from '@/src/hooks/useAdmin';

export default function AdminCalendarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    campaigns,
    error,
    isLoadingContents,
    loadContents,
  } = useAdminContents({
    page: 1,
    limit: 100, // Fetch more to get a good sample of users with calendars
  });

  useEffect(() => {
    loadContents().catch(() => undefined);
  }, [loadContents]);

  // Extract unique users who have at least one campaign
  const usersWithCalendars = useMemo(() => {
    const userMap = new Map();
    campaigns.forEach((campaign) => {
      if (!userMap.has(campaign.userId)) {
        userMap.set(campaign.userId, {
          ...campaign.user,
          industry: campaign.strategy?.industry,
          campaignCount: campaigns.filter(c => c.userId === campaign.userId).length
        });
      }
    });
    return Array.from(userMap.values());
  }, [campaigns]);

  const filteredUsers = useMemo(() => {
    return usersWithCalendars.filter((user) => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usersWithCalendars, searchTerm]);

  if (isLoadingContents && campaigns.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-slate-500 font-medium">Chargement des calendriers...</p>
        </div>
      </div>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Oups !</h2>
          <p className="mb-8 text-sm text-slate-600">Impossible de charger les calendriers. {error}</p>
          <button
            onClick={() => void loadContents()}
            className="w-full rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition-all hover:bg-violet-700 active:scale-95 shadow-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-purple-200/25 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
              <CalendarDays className="w-3 h-3" />
              Planning Hub
            </span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Gestion des Calendriers
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              Supervisez les plannings éditoriaux de vos clients. Seuls les utilisateurs ayant généré des calendriers sont affichés ici.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadContents()}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 active:scale-95"
              title="Rafraîchir"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </button>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calendriers Actifs</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{usersWithCalendars.length}</p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-2.5 text-violet-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Campagnes</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{campaigns.length}</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-2.5 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </article>
      </div>

      {/* Main panel */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search bar */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher (nom, email, entreprise)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 placeholder:text-slate-400"
              />
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              {filteredUsers.length} résultat(s)
            </div>
          </div>
        </div>

        {/* User Grid */}
        <div className="p-4 sm:p-5">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-sm">
              <LayoutGrid className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-900">Aucun calendrier trouvé</p>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}"`
                  : "Aucun utilisateur n'a de calendrier pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                        {user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          user.isBanned
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {user.isBanned ? 'Banni' : 'Actif'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {user.campaignCount} Campagnes
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{user.fullName}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{user.email}</p>
                    </div>

                    <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-violet-400" />
                        <span className="truncate">{user.companyName || 'Sans entreprise'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-violet-400" />
                        <span className="truncate">{user.industry || 'Secteur non défini'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 text-violet-400" />
                        <span>{user.role === 'admin' ? 'Administrateur' : 'Client standard'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Link
                      href={`/admin/users/${user.id}/calendar`}
                      className="flex inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                    >
                      Voir Calendrier <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                      title="Voir Profil"
                    >
                      <Users className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
