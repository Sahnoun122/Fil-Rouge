'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { AppRole, getNavigationForRole, getPageTitleFromPath } from '@/src/constants/navigation';

type DashboardNavbarProps = {
  role?: AppRole;
};

export default function DashboardNavbar({ role }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const resolvedRole: AppRole = role ?? (user?.role as AppRole) ?? 'user';
  const navigation = getNavigationForRole(resolvedRole);
  const contentQuickItem = {
    name: 'Content',
    href: '/user/content',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 8h10M7 12h7m-7 4h10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        />
      </svg>
    ),
  };
  const navigationWithoutContent = navigation.filter(
    (item) => item.href !== '/content' && item.href !== '/user/content',
  );
  const renderedNavigation =
    resolvedRole === 'user'
      ? navigationWithoutContent.length >= 2
        ? [
            ...navigationWithoutContent.slice(0, 2),
            contentQuickItem,
            ...navigationWithoutContent.slice(2),
          ]
        : [...navigationWithoutContent, contentQuickItem]
      : navigationWithoutContent;

  const pageTitle = getPageTitleFromPath(pathname, resolvedRole);
  const quickAction =
    resolvedRole === 'admin'
      ? { label: 'Gérer les utilisateurs', href: '/admin/users' }
      : { label: 'Nouvelle stratégie', href: '/user/strategies/new' };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-slate-100 bg-white/95 shadow-sm shadow-slate-200/60 backdrop-blur-md px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-4">

        {/* Left: page title */}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-tight">
            {resolvedRole === 'admin' ? 'Espace admin' : 'Espace utilisateur'}
          </p>
          <h2 className="text-lg font-black text-slate-900 leading-tight truncate">{pageTitle}</h2>
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nav pills (hidden on small screens) */}
          <div className="hidden xl:flex items-center gap-1 mr-1">
            {renderedNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-violet-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href={quickAction.href}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {quickAction.label}
          </Link>

          {/* Bell */}
          <button
            type="button"
            className="relative h-8 w-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User chip */}
          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition hover:border-red-200 hover:bg-red-50 group"
          >
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {initials}
            </div>
            <span className="hidden md:block text-xs font-semibold text-slate-700 group-hover:text-red-600 transition-colors max-w-25 truncate">
              {user?.fullName?.split(' ')[0] || 'Utilisateur'}
            </span>
            <LogOut className="hidden md:block w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
