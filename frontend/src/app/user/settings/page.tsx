'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Palette, User, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { userService } from '@/src/services/userService';
import { persistAuthUser } from '@/src/utils/authStorage';
import type { UserPreferences } from '@/src/types/auth';

type Toast = { type: 'success' | 'error'; message: string };

const DEFAULT_PREFS: UserPreferences = {
  emailNotifications: true,
  contentReminders: true,
  weeklyDigest: false,
};

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${
        checked ? 'bg-violet-600' : 'bg-slate-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function UserSettingsPage() {
  const { user } = useAuth();

  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState<keyof UserPreferences | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (user?.preferences) {
      setPrefs(user.preferences);
    }
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleToggle = useCallback(
    async (key: keyof UserPreferences, value: boolean) => {
      const previous = prefs[key];
      setPrefs((p) => ({ ...p, [key]: value }));
      setSaving(key);
      try {
        const updatedUser = await userService.updatePreferences({ [key]: value });
        const newPrefs: UserPreferences = updatedUser?.preferences ?? { ...prefs, [key]: value };
        setPrefs(newPrefs);
        if (user) {
          persistAuthUser({ ...user, preferences: newPrefs });
        }
        setToast({ type: 'success', message: 'Preference mise a jour.' });
      } catch (err) {
        setPrefs((p) => ({ ...p, [key]: previous }));
        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la mise a jour' });
      } finally {
        setSaving(null);
      }
    },
    [prefs, user],
  );

  const notifItems: { key: keyof UserPreferences; label: string; description: string }[] = [
    {
      key: 'emailNotifications',
      label: 'Notifications par email',
      description: 'Recevoir des rappels de publication par email',
    },
    {
      key: 'contentReminders',
      label: 'Rappels de contenu',
      description: 'Recevoir des rappels in-app avant chaque publication planifiee',
    },
    {
      key: 'weeklyDigest',
      label: 'Resume hebdomadaire',
      description: 'Recevoir un rapport de performance chaque semaine',
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 shadow-sm shadow-violet-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parametres</h1>
          <p className="text-sm text-slate-500">Configurez votre experience sur la plateforme</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
            <Bell className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {saving === item.key && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
                )}
                <Toggle
                  checked={prefs[item.key]}
                  onChange={(v) => void handleToggle(item.key, v)}
                  disabled={saving !== null}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
            <Palette className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Apparence</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Clair', active: true },
              { label: 'Sombre', active: false },
              { label: 'Systeme', active: false },
            ].map((theme) => (
              <button
                key={theme.label}
                disabled
                title="Bientot disponible"
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  theme.active
                    ? 'border-violet-400 bg-violet-50 text-violet-700 ring-2 ring-violet-500/20'
                    : 'border-slate-200 bg-white text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">Le mode sombre sera disponible dans une prochaine version.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
            <User className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Compte</h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500">Nom complet</p>
              <p className="text-sm font-medium text-slate-900">{user?.fullName || '-'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{user?.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500">Membre depuis</p>
              <p className="text-sm font-medium text-slate-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '-'}
              </p>
            </div>
          </div>
          {user?.lastLoginAt && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">Derniere connexion</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(user.lastLoginAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}