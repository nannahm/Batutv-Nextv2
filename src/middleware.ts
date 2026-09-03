import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests to pass through to the client-side router & App which handles session validation and RBAC
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/batutv-control/:path*',
  ],
};


