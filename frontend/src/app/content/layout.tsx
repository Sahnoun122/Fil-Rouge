import { ReactNode } from 'react';
import UserLayout from '@/src/components/layout/UserLayout';

export default function ContentLayout({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
