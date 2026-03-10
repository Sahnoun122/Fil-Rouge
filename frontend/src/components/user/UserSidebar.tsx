'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userNavigation } from '@/src/constants/navigation';

interface UserSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function UserSidebar({ isOpen, setIsOpen }: UserSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActivePath = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  const contentNavItem = {
    name: 'Content',
    href: '/user/content',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 8h10M7 12h7m-7 4h10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        />
      </svg>
    ),
  };

  const baseNavigationItems = userNavigation.filter(
    (item) => item.href !== '/content' && item.href !== '/user/content',
  );

  const navigationItems =
    baseNavigationItems.length >= 2
      ? [
          ...baseNavigationItems.slice(0, 2),
          contentNavItem,
          ...baseNavigationItems.slice(2),
        ]
      : [...baseNavigationItems, contentNavItem];

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
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-white border-r border-slate-100/80 shadow-2xl shadow-slate-300/20 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/30 transition group-hover:shadow-violet-500/50 group-hover:scale-105">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight">
                MarketPlan <span className="text-violet-600">IA</span>
              </p>
              <p className="text-[10px] font-medium text-slate-400 leading-tight">Workspace</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New strategy CTA */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/user/strategies/new"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-700 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-violet-500/40 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Nouvelle stratégie
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
          {navigationItems.map((item) => {
            const active = isActivePath(item.href);
            return (
              <Link
                key={`${item.name}-${item.href}`}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-violet-50 text-violet-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-violet-600" />
                )}
                <span
                  className={`shrink-0 transition-colors ${
                    active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-sm shadow-violet-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}


        {/* User footer */}
        <div className="border-t border-slate-100 p-4 space-y-3">
          <Link
            href="/user/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all duration-150 ${
              isActivePath('/user/profile')
                ? 'bg-violet-50 border-violet-100'
                : 'bg-linear-to-br from-slate-50 to-slate-100/80 border-slate-100 hover:border-violet-200 hover:bg-violet-50/60'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm shadow-violet-500/30">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 leading-tight">{user?.fullName || 'Utilisateur'}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email || '-'}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition-all duration-150 hover:border-red-200 hover:bg-red-50/80 hover:text-red-600 active:scale-95"
            type="button"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
