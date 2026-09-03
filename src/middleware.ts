import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = '__session';

/**
 * Middleware Guard untuk rute /batutv-control/*
 *
 * Catatan Arsitektur (D-018):
 * Next.js Middleware berjalan di Edge Runtime yang tidak mendukung Node.js `net`/`tls`
 * yang dibutuhkan oleh Firebase Admin SDK (gRPC/certificate parsing).
 *
 * Oleh karena itu, pengamanan rute admin di Edge Runtime menerapkan:
 * 1. Fast Edge Guard: Memeriksa keberadaan httpOnly session cookie (`__session`).
 *    Jika tidak ada cookie, request langsung di-redirect ke `/login?redirect=...`.
 * 2. Deep Cryptographic & RBAC Verification:
 *    - Di server context (Server Actions & API Routes seperti `/api/auth/session` dan `serverActions.ts`),
 *      token diverifikasi penuh menggunakan `firebase-admin/auth` (`verifySessionCookie` / `verifyIdToken`).
 *    - Di client/portal context, App component & Auth provider memvalidasi custom claims dan state user.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Jalur khusus login dan aset statis tidak perlu diproteksi
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Proteksi rute administrasi CMS: /batutv-control/*
  if (pathname.startsWith('/batutv-control')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    // Jika cookie session tidak ada atau bukan format token JWT valid (3 segmen), redirect ke login
    if (!sessionCookie || sessionCookie.split('.').length !== 3 || sessionCookie.length < 50) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Header diteruskan untuk downstream server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-authenticated-admin', 'true');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/batutv-control/:path*',
  ],
};
