import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/src/lib/firebaseAdmin';
import { SESSION_COOKIE_NAME } from '@/src/features/auth/types';

// Durasi session cookie: 5 hari (dalam milidetik)
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'ID token wajib disertakan dalam request.' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();

    // Verifikasi idToken dari client
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'ID token tidak valid atau telah kedaluwarsa.' },
        { status: 401 }
      );
    }

    // Buat session cookie httpOnly yang aman
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Sesi autentikasi berhasil dibuat.',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'reporter',
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Set cookie httpOnly pada response
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: Math.floor(EXPIRES_IN / 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/session POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses session cookie.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(sessionCookie);
        if (decoded?.sub) {
          await adminAuth.revokeRefreshTokens(decoded.sub);
        }
      } catch (e) {
        // Token mungkin sudah expired saat logout
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Sesi logout berhasil dibersihkan.',
    });

    // Clear cookie
    response.cookies.delete({
      name: SESSION_COOKIE_NAME,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/auth/session DELETE] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menghapus sesi.' },
      { status: 500 }
    );
  }
}
