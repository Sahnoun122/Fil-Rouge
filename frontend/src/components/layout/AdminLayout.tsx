'use client';

// components/layout/AdminLayout.tsx - Layout principal pour Admin

import { useState, useEffect } from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../ProtectedRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Fermer la sidebar sur mobile lors du changement de route
  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Mobile header */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              {title || 'Administration'}
            </h1>
            
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </header>
          
          {/* Content area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}