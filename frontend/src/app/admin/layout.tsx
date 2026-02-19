import { ReactNode } from 'react';
import AdminLayout from '@/src/components/layout/AdminLayout';

export default function AdminAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
