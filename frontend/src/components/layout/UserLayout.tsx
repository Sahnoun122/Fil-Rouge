'use client';

import { ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserSidebar from '../user/UserSidebar';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import { useAuth } from '@/src/hooks/useAuth';

const ProtectedRoute = dynamic(() => import('../ProtectedRoute'), { ssr: false });

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
}

const routeLabels: Record<string, string> = {
  '/user/dashboard': 'Dashboard',
  '/user/strategies': 'Strategies',
  '/user/swot': 'SWOT Analysis',
  '/user/content': 'Content',
  '/user/calendar': 'Calendar',
  '/user/profile': 'Profile',
  '/user/settings': 'Settings',
  '/user/ai-monitoring': 'AI Monitoring',
};

function getPageLabel(pathname: string): string {
  for (const [route, label] of Object.entries(routeLabels)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) return label;
  }
  return 'Workspace';
}

export default function UserLayout({ children }: UserLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const pageLabel = getPageLabel(pathname);
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <ProtectedRoute requiredRole="user">
      <div className="flex min-h-screen bg-slate-50/80">
        <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          {/* Top header */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md lg:px-6">
            {/* Left: hamburger + page title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                aria-label="Open navigation"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden lg:block">
                <h2 className="text-sm font-bold text-slate-800">{pageLabel}</h2>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              <NotificationsDropdown />
              <Link
                href="/user/profile"
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition hover:border-violet-200 hover:bg-violet-50"
                aria-label="Profile"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {initials}
                </div>
                <span className="hidden text-xs font-semibold text-slate-700 group-hover:text-violet-700 sm:block max-w-[120px] truncate">
                  {user?.fullName || 'Account'}
                </span>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="px-4 pb-8 pt-6 lg:px-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
