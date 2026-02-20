'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const pageTitle = getPageTitleFromPath(pathname, resolvedRole);
  const quickAction =
    resolvedRole === 'admin'
      ? { label: 'Gerer les utilisateurs', href: '/admin/users' }
      : { label: 'Nouvelle strategie', href: '/user/strategies/new' };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Utilisateur';

  return (
    <div className="sticky top-4 z-20 rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {resolvedRole === 'admin' ? 'Espace admin' : 'Espace utilisateur'}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">{pageTitle}</h2>
            {user ? (
              <p className="text-sm text-slate-500">
                {firstName} - {user.email}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={quickAction.href}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {quickAction.label}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            >
              Deconnexion
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
