'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageManagementModule } from '@/src/components/admin/pages/PageManagementModule';

export default function AdminPagesDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageManagementModule
        onNavigateToPublic={(path) => router.push(path)}
      />
    </div>
  );
}
