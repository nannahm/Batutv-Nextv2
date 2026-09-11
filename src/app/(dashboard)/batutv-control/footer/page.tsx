'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FooterManagementModule } from '@/src/components/admin/footer/FooterManagementModule';

export default function AdminFooterDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <FooterManagementModule
        onNavigateToPublic={(path) => router.push(path)}
      />
    </div>
  );
}
