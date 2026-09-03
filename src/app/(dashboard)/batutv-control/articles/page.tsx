'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { NewsManagementModule } from '@/src/components/admin/news/NewsManagementModule';
import { getStoredAdminSession } from '@/src/utils/authSession';

export default function AdminArticlesDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState(getStoredAdminSession());

  React.useEffect(() => {
    setCurrentUser(getStoredAdminSession());
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <NewsManagementModule
        currentPath="/batutv-control/articles"
        onNavigate={(path) => router.push(path)}
        currentUser={currentUser}
      />
    </div>
  );
}
