import { ReactNode } from 'react';
import UserLayout from '@/src/components/layout/UserLayout';

export default function UserGroupLayout({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
