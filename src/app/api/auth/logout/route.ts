import { NextResponse } from 'next/server';
import { clearSessionCookies } from '@/lib/session';

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearSessionCookies(res);
  return res;
}
