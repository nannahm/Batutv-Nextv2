'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MediaManagementModule } from '@/src/components/admin/media/MediaManagementModule';

export default function AdminMediaDashboardPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <MediaManagementModule
        onNavigateToPublic={(path) => router.push(path)}
      />
    </div>
  );
}
