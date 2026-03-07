'use client';

import UserPlan from '@/src/components/UserPlan';
import { useAuth } from '@/src/hooks/useAuth';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Loading your admin dashboard…</div>
      </div>
    );
  }

  const firstName = user.fullName.split(' ')[0] || user.fullName;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-10 max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Administration</p>
          <h1 className="text-4xl font-black text-gray-900">Welcome, {firstName}</h1>
          <p className="text-base text-gray-600">Secure view of access, users, and platform metrics.</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Active users', value: '1,248', trend: '+4.2%' },
            { label: 'Logins this week', value: '3,642', trend: '+8.7%' },
            { label: 'Strategies generated', value: '6,900', trend: '+2.1%' },
          ].map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm">
              <p className="text-sm text-gray-500">{tile.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{tile.value}</p>
              <span className="text-xs font-semibold text-emerald-600">{tile.trend} vs. last week</span>
            </div>
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Critical updates</h2>
            <p className="text-sm text-gray-600">No major incidents reported. Latest token syncs are up to date and all protected routes are responding.</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>• 50 new accounts created today.</li>
              <li>• 12 admin requests pending validation.</li>
              <li>• No critical server offline in the last 24 hours.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-100">Administration</p>
            <h3 className="text-2xl font-semibold mt-4">{user.fullName}</h3>
            <p className="text-sm text-blue-50 mt-1">{user.email}</p>
            <p className="mt-6 text-sm text-blue-100">Role: {user.role === 'admin' ? 'Admin' : 'User'}</p>
          </div>
        </section>

        <UserPlan />
      </div>
    </div>
  );
}
