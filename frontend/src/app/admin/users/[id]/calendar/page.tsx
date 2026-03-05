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
  if (status === 'published') return 'Publie';
  if (status === 'late') return 'En retard';
  return 'Planifie';
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
  const [status, setStatus] = useState<'all' | ScheduledPost['status']>('all');

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
      status: status === 'all' ? undefined : status,
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
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Chargement du calendrier utilisateur...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Calendrier introuvable</h2>
          <p className="mb-6 text-slate-600">
            {error || 'Impossible de charger ce calendrier utilisateur.'}
          </p>
          <Link
            href={`/admin/users/${userId}`}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
          <Link href="/admin/users" className="transition-colors hover:text-slate-700">
            Utilisateurs admin
          </Link>
          <span>-</span>
          <Link
            href={`/admin/users/${user.id}`}
            className="max-w-64 truncate transition-colors hover:text-slate-700"
          >
            {user.fullName || user.email}
          </Link>
          <span>-</span>
          <span className="font-medium text-slate-900">Calendrier</span>
        </nav>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Admin calendar
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Calendrier de {user.fullName || user.email}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Vue admin centralisee des publications programmees de cet utilisateur,
                avec lecture par jour, statut, plateforme et acces direct aux campagnes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/users/${user.id}`}
                className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour profil
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publications</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Planifiees</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.planned}</p>
          </article>
          <article className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Publiees</p>
            <p className="mt-2 text-3xl font-bold text-cyan-900">{stats.published}</p>
          </article>
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">En retard</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">{stats.late}</p>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Filtres du calendrier</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium">Date de debut</span>
              <input
                type="date"
                value={rangeStart}
                onChange={(event) => setRangeStart(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              />
            </label>

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium">Date de fin</span>
              <input
                type="date"
                value={rangeEnd}
                onChange={(event) => setRangeEnd(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              />
            </label>

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium">Plateforme</span>
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value as typeof platform)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
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

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium">Statut</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              >
                <option value="all">Tous</option>
                <option value="planned">Planifie</option>
                <option value="published">Publie</option>
                <option value="late">En retard</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void handleApplyFilters()}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <TimerReset className="mr-2 h-4 w-4" />
                Actualiser
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Planning utilisateur
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Agenda editorial
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {posts.length} publication(s)
            </span>
          </div>

          {isLoadingCalendar ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Chargement du calendrier...
            </div>
          ) : postsByDay.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Aucune publication planifiee sur la periode selectionnee.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {postsByDay.map((group) => (
                <section key={group.date} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    <h3 className="text-base font-semibold text-slate-900">
                      {formatDateTime(`${group.date}T12:00:00.000Z`).replace(/ à .*/, '')}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {group.items.length} post(s)
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {group.items.map((post) => (
                      <article
                        key={post._id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                              {post.platform}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {post.postType}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                              {formatStatus(post.status)}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatTime(post.scheduledAt)}
                            </p>
                            <p className="text-xs text-slate-500">{post.timezone}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              Publication
                            </p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">
                              {post.title || 'Publication sans titre'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(post.scheduledAt)}
                            </p>
                          </div>

                          <div>
                            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              <Layers3 className="h-3.5 w-3.5" />
                              Caption
                            </p>
                            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {post.caption}
                            </p>
                          </div>

                          {post.hashtags.length > 0 ? (
                            <div>
                              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                <Globe2 className="h-3.5 w-3.5" />
                                Hashtags
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {post.hashtags.slice(0, 5).map((tag) => (
                                  <span
                                    key={`${post._id}-${tag}`}
                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                            <div className="text-xs text-slate-500">
                              {post.campaignId ? `Campagne ${post.campaignId}` : 'Sans campagne'}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {post.campaignId ? (
                                <Link
                                  href={`/admin/content/${post.campaignId}`}
                                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                  Voir campagne
                                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Link>
                              ) : null}

                              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Detail admin
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
