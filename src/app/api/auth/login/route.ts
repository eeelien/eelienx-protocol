import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { decrypt, deriveKey } from '@/lib/crypto';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email y contraseña requeridos' });
    }

    // 1. Buscar usuario
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, encrypted_master_key')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // 2. Verificar contraseña
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // 3. Descifrar llave maestra con llave derivada de la contraseña
    const passwordKey = deriveKey(password, email.toLowerCase());
    const masterKey = decrypt(user.encrypted_master_key, passwordKey);

    // 4. Crear sesión JWT
    const token = await createSession({
      userId: user.id,
      email: user.email,
      masterKey,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

    res.cookies.set('eelienx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno' });
  }
}
