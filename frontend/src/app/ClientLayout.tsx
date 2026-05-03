'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardProvider } from './dashboard/context';
import DashboardLayoutContent from './dashboard/DashboardLayoutContent';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = pathname === '/login' || pathname === '/';

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-medium">Carregando...</div>
      </div>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
