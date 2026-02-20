'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { adminNavigation } from '@/src/constants/navigation';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActivePath = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

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
            <h2 className="text-lg font-bold text-slate-900">Admin console</h2>
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
          {adminNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActivePath(item.href)
                  ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={isActivePath(item.href) ? 'text-rose-600' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-200 p-4">
          <Link
            href="/admin/users"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Gerer les utilisateurs
          </Link>

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName || 'Administrateur'}</p>
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
