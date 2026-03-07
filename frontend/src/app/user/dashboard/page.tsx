'use client';

import UserPlan from '@/src/components/UserPlan';
import { useAuth } from '@/src/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Loading your secure workspace…</div>
      </div>
    );
  }

  const firstName = user.fullName.split(' ')[0] || user.fullName;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">MarketPlan IA</p>
          <h1 className="text-4xl font-black text-gray-900">Welcome, {firstName}</h1>
          <p className="text-base text-gray-600">Here is a secure summary of your profile and data fetched from the API.</p>
        </header>

        <UserPlan />
      </div>
    </div>
  );
}
