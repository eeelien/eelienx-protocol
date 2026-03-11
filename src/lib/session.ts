import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { encrypt, decrypt } from './crypto';

// JWT secret — lazy to avoid build-time errors, fails hard at runtime if not set
function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET env var is required');
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  userId: string;
  email: string;
  // masterKey is NOT stored here — stored separately in a split cookie
}

// ─── JWT (userId + email only) ────────────────────────────────────────────────

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Split cookie: masterKey never travels raw ────────────────────────────────
// The masterKey is split across 2 httpOnly cookies:
//   eelienx_session     → JWT (userId, email)
//   eelienx_mk          → masterKey encrypted with a random sessionSecret
//   eelienx_sk          → the sessionSecret itself
//
// An attacker needs ALL THREE cookies to reconstruct the masterKey.
// Stealing just the JWT cookie is not enough.

export function encryptMasterKeyForSession(masterKey: string): {
  encryptedMK: string;
  sessionSecret: string;
} {
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  const encryptedMK = encrypt(masterKey, Buffer.from(sessionSecret, 'hex'));
  return { encryptedMK, sessionSecret };
}

export function decryptMasterKeyFromSession(
  encryptedMK: string,
  sessionSecret: string
): string {
  return decrypt(encryptedMK, Buffer.from(sessionSecret, 'hex'));
}

// ─── Cookie helpers ────────────────────────────────────────────────────────────

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 días
  path: '/',
};

export function setSessionCookies(
  res: { cookies: { set: Function } },
  jwt: string,
  encryptedMK: string,
  sessionSecret: string
) {
  res.cookies.set('eelienx_session', jwt, COOKIE_OPTS);
  res.cookies.set('eelienx_mk', encryptedMK, COOKIE_OPTS);
  res.cookies.set('eelienx_sk', sessionSecret, COOKIE_OPTS);
}

export function clearSessionCookies(res: { cookies: { set: Function } }) {
  const expired = { ...COOKIE_OPTS, maxAge: 0 };
  res.cookies.set('eelienx_session', '', expired);
  res.cookies.set('eelienx_mk', '', expired);
  res.cookies.set('eelienx_sk', '', expired);
}

// ─── Get full session (JWT + masterKey) ───────────────────────────────────────

export interface FullSession extends SessionPayload {
  masterKey: string; // hex
}

export async function getSession(): Promise<FullSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('eelienx_session')?.value;
  const encryptedMK = cookieStore.get('eelienx_mk')?.value;
  const sessionSecret = cookieStore.get('eelienx_sk')?.value;

  if (!token || !encryptedMK || !sessionSecret) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  try {
    const masterKey = decryptMasterKeyFromSession(encryptedMK, sessionSecret);
    return { ...payload, masterKey };
  } catch {
    return null;
  }
}
