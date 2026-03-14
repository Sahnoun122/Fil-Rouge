'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  Globe2,
  Layers3,
  TimerReset,
  TrendingUp,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { useAdminUser, useAdminUserCalendar } from '@/src/hooks/useAdmin';
import type { ScheduledPost } from '@/src/types/calendar.types';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
  timeStyle: 'short',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

function toInputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    rangeStart: toInputDate(firstDay),
    rangeEnd: toInputDate(lastDay),
  };
}

function toRangeStartIso(date: string) {
  return new Date(`${date}T00:00:00.000`).toISOString();
}

function toRangeEndIso(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return DATE_TIME_FORMATTER.format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return TIME_FORMATTER.format(date);
}

function formatStatus(status: ScheduledPost['status']) {
  if (status === 'published') return 'Publié';
  if (status === 'late') return 'En retard';
  return 'Programmé';
}

function groupPostsByDay(posts: ScheduledPost[]) {
  const groups = new Map<string, ScheduledPost[]>();

  for (const post of posts) {
    const key = new Date(post.scheduledAt).toISOString().slice(0, 10);
    const current = groups.get(key) ?? [];
    current.push(post);
    groups.set(key, current);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, items]) => ({
      date,
      items: [...items].sort(
        (left, right) =>
          new Date(left.scheduledAt).getTime() -
          new Date(right.scheduledAt).getTime(),
      ),
    }));
}

export default function AdminUserCalendarPage() {
  const params = useParams();
  const userId = params.id as string;
  const defaultRange = useMemo(() => getMonthRange(), []);
  const [rangeStart, setRangeStart] = useState(defaultRange.rangeStart);
  const [rangeEnd, setRangeEnd] = useState(defaultRange.rangeEnd);
  const [platform, setPlatform] = useState<'all' | ScheduledPost['platform']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ScheduledPost['status']>('all');

  const { user, error: userError, isLoadingUser, loadUser } = useAdminUser();
  const {
    calendar,
    error: calendarError,
    isLoadingCalendar,
    loadCalendar,
  } = useAdminUserCalendar({
    rangeStart: toRangeStartIso(defaultRange.rangeStart),
    rangeEnd: toRangeEndIso(defaultRange.rangeEnd),
    page: 1,
    limit: 100,
  });

  useEffect(() => {
    if (!userId) {
      return;
    }

    loadUser(userId).catch(() => undefined);
    loadCalendar(userId).catch(() => undefined);
  }, [loadCalendar, loadUser, userId]);

  const handleApplyFilters = async () => {
    await loadCalendar(userId, {
      rangeStart: toRangeStartIso(rangeStart),
      rangeEnd: toRangeEndIso(rangeEnd),
      platform: platform === 'all' ? undefined : platform,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: 1,
      limit: 100,
    });
  };

  const posts = calendar?.posts ?? [];
  const postsByDay = useMemo(() => groupPostsByDay(posts), [posts]);

  const stats = useMemo(() => {
    const planned = posts.filter((post) => post.status === 'planned').length;
    const published = posts.filter((post) => post.status === 'published').length;
    const late = posts.filter((post) => post.status === 'late').length;

    return {
      total: posts.length,
      planned,
      published,
      late,
    };
  }, [posts]);

  const isLoading = isLoadingUser || isLoadingCalendar;
  const error = userError || calendarError;

  if (isLoading && !user && !calendar) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-slate-500 font-medium">Chargement du calendrier utilisateur...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Pas de calendrier</h2>
          <p className="mb-8 text-sm text-slate-600">
            {error || "Impossible de charger le calendrier de cet utilisateur."}
          </p>
          <Link
            href={`/admin/users/${userId}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au profil
          </Link>
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

        <div className="relative flex flex-col gap-4">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link href="/admin/users" className="hover:text-violet-700 transition">Utilisateurs</Link>
            <span>/</span>
            <Link href={`/admin/users/${user.id}`} className="hover:text-violet-700 transition max-w-32 truncate">{user.fullName}</Link>
            <span>/</span>
            <span className="text-slate-800">Calendrier</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                <CalendarDays className="w-3 h-3" />
                Planning Individuel
              </span>
              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
                Calendrier de {user.fullName}
              </h1>
              <p className="max-w-xl text-sm text-slate-500">
                Vue centralisée des publications programmées pour cet utilisateur par jour, statut et plateforme.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/users/${user.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Détails Profil
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Posts', value: stats.total, icon: Layers3, accent: 'bg-violet-50 text-violet-600 border-violet-100', bar: 'from-violet-500 to-purple-500' },
          { label: 'Programmés', value: stats.planned, icon: Clock3, accent: 'bg-indigo-50 text-indigo-600 border-indigo-100', bar: 'from-indigo-500 to-blue-500' },
          { label: 'Publiés', value: stats.published, icon: CheckCircle, accent: 'bg-emerald-50 text-emerald-600 border-emerald-100', bar: 'from-emerald-500 to-teal-500' },
          { label: 'En retard', value: stats.late, icon: Ban, accent: 'bg-orange-50 text-orange-600 border-orange-100', bar: 'from-orange-500 to-amber-500' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
                </div>
                <div className={`rounded-xl border p-2.5 ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div 
                  className={`h-full bg-gradient-to-r ${card.bar} transition-all duration-1000`} 
                  style={{ width: stats.total > 0 ? `${(card.value / stats.total) * 100}%` : '0%' }}
                />
              </div>
            </article>
          );
        })}
      </section>

      {/* Main panel */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">Filtres du calendrier</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date début</span>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date fin</span>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plateforme</span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as typeof platform)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="all">Toutes</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="pinterest">Pinterest</option>
                <option value="x">X</option>
                <option value="snapchat">Snapchat</option>
                <option value="threads">Threads</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="all">Tous</option>
                <option value="planned">Programmés</option>
                <option value="published">Publiés</option>
                <option value="late">En retard</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void handleApplyFilters()}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition border border-violet-200 hover:bg-violet-100 disabled:opacity-50"
                disabled={isLoadingCalendar}
              >
                <TimerReset className={`h-4 w-4 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Publications</h3>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              {posts.length} pub. ce mois-ci
            </div>
          </div>

          {isLoadingCalendar ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mb-4" />
              <p className="text-sm font-medium text-slate-500">Récupération des publications...</p>
            </div>
          ) : postsByDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-900">Aucun post trouvé</p>
              <p className="text-slate-500 mt-1 max-w-sm">
                Il n&apos;y a aucune publication programmée pour la période sélectionnée.
              </p>
            </div>
          ) : (
            <div className="space-y-8 relative before:absolute before:left-3 before:top-4 before:bottom-0 before:w-px before:bg-slate-200">
              {postsByDay.map((group) => (
                <div key={group.date} className="relative pl-10">
                  <div className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white border border-slate-200 z-10">
                    <CalendarDays className="h-3 w-3 text-slate-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      {formatDateTime(`${group.date}T12:00:00.000Z`).replace(/ à .*/, '')}
                    </h4>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {group.items.length} post(s)
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map((post) => (
                      <article
                        key={post._id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase text-white tracking-wide">
                                {post.platform}
                              </span>
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
                                {post.postType}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-900 leading-none">
                                {formatTime(post.scheduledAt)}
                              </p>
                              <p className="text-[9px] font-semibold text-slate-400 uppercase">{post.timezone}</p>
                            </div>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${
                            post.status === 'published' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                            post.status === 'late' ? 'bg-orange-50 border border-orange-100 text-orange-700' :
                            'bg-indigo-50 border border-indigo-100 text-indigo-700'
                          }`}>
                            {formatStatus(post.status)}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 mb-3 group-hover:text-violet-600 transition-colors line-clamp-2">
                            {post.title || 'Publication sans titre'}
                          </h5>

                          <div className="rounded-xl bg-slate-50 p-3 text-xs">
                            <p className="font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                              <Layers3 className="h-3 w-3" /> Contenu
                            </p>
                            <p className="line-clamp-3 text-slate-700">
                              {post.caption}
                            </p>
                          </div>

                          {post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {post.hashtags.slice(0, 4).map((tag) => (
                                <span key={tag} className="text-[10px] font-semibold text-violet-500">#{tag}</span>
                              ))}
                              {post.hashtags.length > 4 && (
                                <span className="text-[10px] font-semibold text-slate-400">+{post.hashtags.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                           <div className="flex items-center gap-1.5 text-slate-400">
                            <Globe2 className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase">
                              {post.campaignId ? 'Campagne liée' : 'Indépendant'}
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            {post.campaignId && (
                               <Link
                                href={`/admin/content/${post.campaignId}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-violet-600"
                                title="Voir campagne"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            )}
                            <button className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-bold uppercase text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700">
                               <CheckCircle2 className="h-3 w-3" />
                               Admin
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
