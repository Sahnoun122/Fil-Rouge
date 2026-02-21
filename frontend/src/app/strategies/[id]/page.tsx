'use client';

import UserLayout from '@/src/components/layout/UserLayout';
import StrategyDetailPage from '@/src/app/user/strategies/[id]/page';

export default function StrategyDetailAliasPage() {
  return (
    <UserLayout>
      <StrategyDetailPage />
    </UserLayout>
  );
}
