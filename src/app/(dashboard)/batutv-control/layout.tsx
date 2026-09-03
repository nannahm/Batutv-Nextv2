import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAuth } from '@/src/lib/firebaseAdmin';
import { SESSION_COOKIE_NAME } from '@/src/features/auth/types';

export const metadata = {
  title: 'BatuTV Control Panel - Dashboard CMS Redaksi',
  description: 'Pusat Manajemen Berita, Video Streaming, Jurnalis, dan Sistem BatuTV.',
};

/**
 * Root Server Component Layout untuk seluruh rute CMS (/batutv-control/*)
 *
 * Menerapkan Verifikasi Kriptografis di level render Server Component:
 * - Edge Middleware melakukan fast rejection jika cookie tidak ada.
 * - Server Component Layout ini melakukan verifikasi kriptografis mendalam
 *   (verifySessionCookie) SEBELUM komponen anak (UI dashboard, modul berita, dll.)
 *   dirender ke browser.
 * - Menutup celah bypass: cookie palsu, malformed, revoked, atau expired
 *   langsung ditolak di server tanpa pernah merender konten sensitif.
 */
export default async function DashboardControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/batutv-control');
  }

  let isAuthenticated = false;
  try {
    const adminAuth = getAdminAuth();
    // Memeriksa keabsahan tanda tangan JWT session cookie & status revocation
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (decodedToken && decodedToken.uid) {
      isAuthenticated = true;
    }
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated) {
    redirect('/login?redirect=/batutv-control');
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {children}
    </div>
  );
}
