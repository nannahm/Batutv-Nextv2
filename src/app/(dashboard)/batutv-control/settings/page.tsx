'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SiteSettingsModule } from '@/src/components/admin/settings/SiteSettingsModule';

export default function AdminSettingsDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <SiteSettingsModule
        onNavigateToPublic={(path) => router.push(path)}
      />
    </div>
  );
}
