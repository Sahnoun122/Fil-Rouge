'use client';

import { ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';
import UserSidebar from '../user/UserSidebar';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

const ProtectedRoute = dynamic(() => import('../ProtectedRoute'), { ssr: false });

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requiredRole="user">
      <div className="flex min-h-screen bg-slate-50/70">
        <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          {/* Top header */}
          <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Open navigation"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                MarketPlan IA
              </p>
            </div>

            <div className="ml-auto">
              <NotificationsDropdown />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 pb-8 pt-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
