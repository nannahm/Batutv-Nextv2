import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/admin/DashboardLayout';
import { getStoredAdminSession } from '@/src/utils/authSession';
import { LoginPage } from '@/src/components/admin/LoginPage';

export default function DashboardControlPage() {
  const [adminUser, setAdminUser] = useState(() => getStoredAdminSession());

  useEffect(() => {
    const session = getStoredAdminSession();
    setAdminUser(session);
  }, []);

  if (!adminUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => setAdminUser(user)}
        onBackToPortal={() => {
          if (typeof window !== 'undefined') window.location.href = '/';
        }}
      />
    );
  }

  return (
    <DashboardLayout
      adminUser={adminUser}
      onLogout={() => {
        setAdminUser(null);
        if (typeof window !== 'undefined') window.location.href = '/login';
      }}
      onBackToPortal={() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }}
    />
  );
}
