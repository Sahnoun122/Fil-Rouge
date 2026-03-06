'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, LogOut, Shield } from 'lucide-react';
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-white border-r border-slate-100 shadow-xl shadow-slate-200/50 transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                MarketPlan <span className="text-violet-600">IA</span>
              </p>
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-rose-500" />
                <p className="text-[10px] font-semibold text-rose-500 leading-tight">Admin</p>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close navigation"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
          {adminNavigation.map((item) => {
            const active = isActivePath(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`shrink-0 transition-colors ${
                  active ? 'text-violet-600' : 'text-slate-400'
                }`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-rose-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName || 'Administrateur'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || '-'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
