'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  Clock,
  Mail,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import { useAdminUser } from '@/src/hooks/useAdmin';

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

type DetailItem = {
  label: string;
  value: string;
};

function DetailGrid({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{item.value || '-'}</p>
        </article>
      ))}
    </div>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { user, error, isLoadingUser, loadUser } = useAdminUser();

  useEffect(() => {
    if (!userId) {
      return;
    }

    loadUser(userId).catch(() => undefined);
  }, [userId, loadUser]);

  const overviewCards = useMemo(() => {
    if (!user) {
      return [];
    }

    return [
      { label: 'Role', value: user.role === 'admin' ? 'Administrateur' : 'Utilisateur' },
      { label: 'Statut', value: user.isBanned ? 'Banni' : 'Actif' },
      { label: 'Derniere connexion', value: formatDate(user.lastLoginAt) },
      { label: 'Derniere mise a jour', value: formatDate(user.updatedAt) },
    ];
  }, [user]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Chargement du profil utilisateur...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Utilisateur introuvable</h2>
          <p className="mb-6 text-slate-600">{error || 'Ce compte est indisponible.'}</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux utilisateurs
          </Link>
        </div>
      </div>
    );
  }

  const identityItems: DetailItem[] = [
    { label: 'Nom complet', value: user.fullName || '-' },
    { label: 'Email', value: user.email || '-' },
    { label: 'Telephone', value: user.phone || '-' },
    { label: 'Entreprise', value: user.companyName || '-' },
    { label: 'Secteur', value: user.industry || '-' },
    { label: 'Compte cree le', value: formatDate(user.createdAt) },
  ];

  const accountItems: DetailItem[] = [
    { label: 'ID utilisateur', value: user.id },
    { label: 'Role applicatif', value: user.role === 'admin' ? 'Administrateur' : 'Utilisateur' },
    { label: 'Etat du compte', value: user.isBanned ? 'Banni' : 'Actif' },
    { label: 'Derniere connexion', value: formatDate(user.lastLoginAt) },
    { label: 'Mise a jour du profil', value: formatDate(user.updatedAt) },
    { label: 'Banni le', value: formatDate(user.bannedAt) },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
          <Link href="/admin/users" className="transition-colors hover:text-slate-700">
            Utilisateurs admin
          </Link>
          <span>-</span>
          <span className="max-w-64 truncate font-medium text-slate-900">{user.fullName || user.email}</span>
        </nav>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
                  <User className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                      {user.fullName || 'Utilisateur sans nom'}
                    </h1>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isBanned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.isBanned ? 'Banni' : 'Actif'}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      {user.email}
                    </p>
                    <p className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      {user.phone || 'Telephone non renseigne'}
                    </p>
                    <p className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      {user.companyName || 'Entreprise non renseignee'}
                    </p>
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Cree le {formatDate(user.createdAt)}
                    </p>
                    <p className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Derniere connexion {formatDate(user.lastLoginAt)}
                    </p>
                    <p className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      ID {user.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/admin/users"
              className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour a la liste
            </Link>

            <Link
              href={`/admin/users/${user.id}/calendar`}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Voir le calendrier
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Informations du profil</h2>
            </div>
            <DetailGrid items={identityItems} />
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Etat du compte</h2>
            </div>
            <DetailGrid items={accountItems} />
          </article>
        </section>

        {user.isBanned || user.banReason ? (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Ban className="h-5 w-5 text-amber-700" />
              <h2 className="text-lg font-semibold text-amber-900">Historique de bannissement</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Statut</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{user.isBanned ? 'Compte actuellement banni' : 'Compte actif'}</p>
              </article>
              <article className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Raison</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{user.banReason || 'Aucune raison enregistree'}</p>
              </article>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
