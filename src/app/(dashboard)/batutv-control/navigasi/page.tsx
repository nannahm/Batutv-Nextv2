'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { NavigationManagementModule } from '@/src/components/admin/navigation/NavigationManagementModule';

export default function AdminNavigationDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <NavigationManagementModule
        onNavigateToPublic={(path) => router.push(path)}
      />
    </div>
  );
}
