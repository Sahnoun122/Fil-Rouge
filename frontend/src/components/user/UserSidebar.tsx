'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

  return (
    <>
      {isOpen ? <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsOpen(false)} /> : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">MarketPlan</p>
            <h2 className="text-lg font-bold text-slate-900">Client workspace</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
            type="button"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigationItems.map((item) => (
            <Link
              key={`${item.name}-${item.href}`}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActivePath(item.href)
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={isActivePath(item.href) ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-200 p-4">
          <Link
            href="/user/strategies/new"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Nouvelle strategie
          </Link>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName || 'Utilisateur'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email || '-'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            type="button"
          >
            Se deconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
