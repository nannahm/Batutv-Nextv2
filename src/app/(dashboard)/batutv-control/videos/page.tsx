'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VideoManagementModule } from '@/src/components/admin/video/VideoManagementModule';
import { getStoredAdminSession } from '@/src/utils/authSession';

export default function AdminVideosDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState(getStoredAdminSession());

  React.useEffect(() => {
    setCurrentUser(getStoredAdminSession());
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <VideoManagementModule
        currentPath="/batutv-control/videos"
        onNavigate={(path) => router.push(path)}
        onNavigateToPublic={(slug) => router.push(`/video/${slug}`)}
        currentUser={currentUser}
      />
    </div>
  );
}
