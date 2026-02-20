'use client';

import { ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import UserSidebar from '../user/UserSidebar';
import DashboardNavbar from '../layouts/DashboardNavbar';
import { getPageTitleFromPath } from '@/src/constants/navigation';

const ProtectedRoute = dynamic(() => import('../ProtectedRoute'), { ssr: false });

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function UserLayout({ children, title }: UserLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = title ?? getPageTitleFromPath(pathname, 'user');

  return (
    <ProtectedRoute requiredRole="user">
      <div className="flex min-h-screen bg-slate-50">
        <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
            <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Open navigation"
              type="button"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 sm:px-6">
              <DashboardNavbar role="user" />
            </div>
            <div className="px-4 pb-8 sm:px-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
