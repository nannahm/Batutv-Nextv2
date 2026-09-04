'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryManagementModule } from '@/src/components/admin/category/CategoryManagementModule';
import { getStoredAdminSession } from '@/src/utils/authSession';

export default function AdminCategoriesDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState(getStoredAdminSession());

  React.useEffect(() => {
    setCurrentUser(getStoredAdminSession());
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <CategoryManagementModule
        onNavigateToPublic={(path) => router.push(path)}
        currentUser={currentUser}
      />
    </div>
  );
}
