'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardPage } from '@/src/components/admin/DashboardPage';
import { getStoredAdminSession } from '@/src/utils/authSession';
import { AdminUser } from '@/src/types/admin';

export default function DashboardControlPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getStoredAdminSession());

  useEffect(() => {
    setCurrentUser(getStoredAdminSession());
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <DashboardPage
        user={currentUser}
        onNavigate={(path) => router.push(path)}
      />
    </div>
  );
}

