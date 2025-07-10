// middleware.js

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ratelimit } from '@/lib/rateLimit';

export async function middleware(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // 1. Rate limiting — always applies
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 2. Protect selected API routes that require authentication
  const pathname = request.nextUrl.pathname;
  const protectedRoutes = [
    '/api/save-history',
    '/api/profile',
    '/api/history', // base route
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/save-history',
    '/api/profile',
    '/api/history',
    '/api/history/:path*', // ✅ includes DELETE /api/history/[id]
  ],
};

