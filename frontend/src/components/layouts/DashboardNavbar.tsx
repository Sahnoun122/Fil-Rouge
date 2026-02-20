'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { adminNavigation, userNavigation } from '@/src/constants/navigation';
import { useAuth } from '@/src/hooks/useAuth';

type DashboardNavbarProps = {
  role?: 'admin' | 'user';
};

export default function DashboardNavbar({ role }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const resolvedRole = role ?? user?.role ?? 'user';
  const navigation =
    resolvedRole === 'admin' ? adminNavigation : userNavigation;
  const quickAction =
    resolvedRole === 'admin'
      ? { label: 'Gérer les utilisateurs', href: '/admin/users' }
      : { label: 'Créer une stratégie', href: '/user/strategies/new' };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  const greeting = user?.fullName?.split(' ')[0] || 'Vous';

  return (
    <div className="sticky top-4 z-20 bg-white border border-gray-200 rounded-3xl shadow-sm px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
          {resolvedRole === 'admin' ? 'Administration' : 'Espace client'}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
            Tableau de bord{' '}
            {resolvedRole === 'admin' ? 'administrateur' : 'utilisateur'}
          </h2>
          {user && (
            <span className="text-sm text-gray-500">
              {greeting} · {user.email}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs tracking-[0.5em] uppercase text-gray-400 hidden lg:block">
          Menu
        </span>
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={quickAction.href}
          className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
        >
          {quickAction.label}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors duration-200"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
