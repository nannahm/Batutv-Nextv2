'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginPage } from '@/src/components/admin/LoginPage';

/**
 * Sanitasi URL tujuan redirect untuk mencegah serangan Open Redirect:
 * - Wajib diawali '/' (path relatif internal)
 * - Menolak protocol-relative ('//')
 * - Menolak scheme eksternal ('://')
 * - Menolak backslash ('\') yang dinormalisasi browser menjadi forward slash
 */
function sanitizeRedirectUrl(target: string | null | undefined): string {
  if (!target) return '/batutv-control';
  if (
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.includes('://') &&
    !target.includes('\\')
  ) {
    return target;
  }
  return '/batutv-control';
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = sanitizeRedirectUrl(rawRedirect);

  return (
    <LoginPage
      onLoginSuccess={() => {
        router.push(safeRedirect);
      }}
      onNavigateHome={() => {
        router.push('/');
      }}
      onBackToPortal={() => {
        router.push('/');
      }}
    />
  );
}

export default function NextAuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
          Memuat halaman login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

