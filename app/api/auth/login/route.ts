import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { decrypt, deriveKey } from '@/lib/crypto';
import { createSession, encryptMasterKeyForSession, setSessionCookies } from '@/lib/session';

// Simple in-memory rate limiter (para producción usar Upstash Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) return false;

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: 'Demasiados intentos. Espera 15 minutos.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    // 1. Buscar usuario (incluye pbkdf_salt)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, encrypted_master_key, pbkdf_salt')
      .eq('email', email.toLowerCase())
      .single();

    // Mismo mensaje para usuario no encontrado vs contraseña incorrecta (evita user enumeration)
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // 2. Verificar contraseña
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // 3. Descifrar llave maestra con salt guardado en DB
    const passwordKey = await deriveKey(password, user.pbkdf_salt);
    const masterKeyHex = decrypt(user.encrypted_master_key, passwordKey);

    // 4. Crear JWT (sin masterKey) + split cookies
    const jwt = await createSession({ userId: user.id, email: user.email });
    const { encryptedMK, sessionSecret } = encryptMasterKeyForSession(masterKeyHex);

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

    setSessionCookies(res, jwt, encryptedMK, sessionSecret);
    return res;

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    console.error('Login error:', msg);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
