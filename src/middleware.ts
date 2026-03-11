import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('eelienx_session')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith('/chat') || pathname.startsWith('/api/exchange-connect') || pathname.startsWith('/api/agent-action');
  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isProtected) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    const session = await verifySession(token);
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuth && token) {
    const session = await verifySession(token);
    if (session) return NextResponse.redirect(new URL('/chat', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/api/exchange-connect/:path*', '/api/agent-action/:path*', '/login', '/register'],
};
