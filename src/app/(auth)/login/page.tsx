import React from 'react';
import { LoginPage } from '@/src/components/admin/LoginPage';

export default function NextAuthLoginPage() {
  const handleLoginSuccess = (admin: any) => {
    if (typeof window !== 'undefined') {
      window.location.href = '/batutv-control';
    }
  };

  const handleBackToPortal = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onBackToPortal={handleBackToPortal}
    />
  );
}
