'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { userService, UpdateProfileData } from '@/src/services/userService';
import { persistAuthUser, clearPersistedAuthUser } from '@/src/utils/authStorage';

const INDUSTRIES = [
  'Marketing', 'E-commerce', 'Tech', 'Education', 'Finance', 'Health', 'Other',
];

type Toast = { type: 'success' | 'error'; message: string };

export default function UserProfilePage() {
  const router = useRouter();
  const { user, logout, checkAuthStatus } = useAuth();

  /* ── Profile form ── */
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    companyName: '',
    industry: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileToast, setProfileToast] = useState<Toast | null>(null);

  /* ── Password form ── */
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwToast, setPwToast] = useState<Toast | null>(null);

  /* ── Delete modal ── */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  /* Prefill from auth context */
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        industry: user.industry || '',
      });
    }
  }, [user]);

  /* Auto-dismiss toasts */
  useEffect(() => {
    if (!profileToast) return;
    const t = setTimeout(() => setProfileToast(null), 3500);
    return () => clearTimeout(t);
  }, [profileToast]);

  useEffect(() => {
    if (!pwToast) return;
    const t = setTimeout(() => setPwToast(null), 3500);
    return () => clearTimeout(t);
  }, [pwToast]);

  /* ── Handlers ── */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileToast(null);
    try {
      const updated = await userService.updateProfile(profile as UpdateProfileData);
      if (user) {
        const newUser = { ...user, ...updated };
        persistAuthUser(newUser);
        await checkAuthStatus();
      }
      setProfileToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: unknown) {
      setProfileToast({ type: 'error', message: err instanceof Error ? err.message : 'Error updating profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwToast(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPwToast({ type: 'error', message: 'New password must be at least 8 characters' });
      return;
    }
    setPwLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwToast({ type: 'success', message: 'Password changed successfully!' });
    } catch (err: unknown) {
      setPwToast({ type: 'error', message: err instanceof Error ? err.message : 'Error changing password' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await userService.deleteOwnAccount();
      await logout();
      clearPersistedAuthUser();
      router.replace('/');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error deleting account');
      setDeleteLoading(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-violet-500/30">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{user?.fullName || 'Mon profil'}</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      {/* ── Edit profile ── */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal information</h2>
            <p className="text-xs text-slate-500 mt-0.5">Update your profile information</p>
          </div>
          <User className="w-5 h-5 text-violet-400" />
        </div>

        {profileToast && (
          <div className={`mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
            profileToast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {profileToast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {profileToast.message}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+212 6 12 34 56 78"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Company
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Acme Corp"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Industry
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={profile.industry}
                  onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white appearance-none"
                >
                  <option value="">Select</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Read-only email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Email <span className="normal-case font-normal text-slate-400">(cannot be changed)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full rounded-xl border border-slate-100 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {profileLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Change password ── */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Change password</h2>
            <p className="text-xs text-slate-500 mt-0.5">Use a strong password (8+ characters)</p>
          </div>
          <Lock className="w-5 h-5 text-violet-400" />
        </div>

        {pwToast && (
          <div className={`mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
            pwToast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {pwToast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {pwToast.message}
          </div>
        )}

        <form onSubmit={handlePasswordSave} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white"
              />
              <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white"
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Confirm
              </label>
              <input
                type={showNewPw ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
                className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:bg-white ${
                  passwords.confirmPassword && passwords.confirmPassword !== passwords.newPassword
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/20'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {pwLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Danger zone ── */}
      <section className="rounded-2xl border border-red-100 bg-white shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Delete my account</h2>
            <p className="text-xs text-slate-500 mt-0.5">This action is irreversible</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Deleting your account permanently erases all your data: strategies, content, calendar, and history. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300"
        >
          <Trash2 className="w-4 h-4" />
          Delete my account
        </button>
      </section>

      {/* ── Delete confirmation modal ── */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); setDeleteError(''); }} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Confirm deletion</h3>
                <p className="text-xs text-slate-500">Irreversible action</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Type <span className="font-bold text-red-600">DELETE</span> to permanently confirm the deletion of your account.
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError(''); }}
              placeholder="DELETE"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition mb-3 focus:ring-2 ${
                deleteError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-slate-200 focus:border-red-400 focus:ring-red-200'
              }`}
            />

            {deleteError && (
              <p className="text-xs text-red-600 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); setDeleteError(''); }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}