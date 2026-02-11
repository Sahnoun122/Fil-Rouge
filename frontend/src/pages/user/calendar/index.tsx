'use client';

// pages/user/calendar/page.tsx - Calendrier utilisateur

import UserLayout from '../../../components/layout/UserLayout';

export default function UserCalendarPage() {
  return (
    <UserLayout title="Calendrier">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Calendrier des Publications
          </h1>
          <p className="text-gray-600 mt-2">
            Visualisez et gérez votre calendrier éditorial
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Vue calendrier</h2>
          <p className="text-gray-600">
            Interface calendrier à implémenter.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}