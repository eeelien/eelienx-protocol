import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'eelienx-jwt-secret-super-seguro-2026'
);

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('eelienx_session')?.value;
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith('/chat') ||
    pathname.startsWith('/api/exchange-connect') ||
    pathname.startsWith('/api/agent-action');

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isProtected) {
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (isAuthPage && token && (await verifyToken(token))) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/api/exchange-connect/:path*',
    '/api/agent-action/:path*',
    '/login',
    '/register',
  ],
};
