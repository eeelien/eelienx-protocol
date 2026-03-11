import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSeedPhrase, deriveMasterKeyFromPhrase } from '@/lib/seedphrase';
import { encrypt, deriveKey } from '@/lib/crypto';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ success: false, message: 'Email y contraseña (mín. 8 caracteres) requeridos' });
    }

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ success: false, message: 'Ya existe una cuenta con ese email' });
    }

    // 1. Generar frase semilla (NUNCA se guarda en DB)
    const seedPhrase = generateSeedPhrase();

    // 2. Derivar llave maestra desde frase semilla
    const masterKey = await deriveMasterKeyFromPhrase(seedPhrase);

    // 3. Cifrar la llave maestra con llave derivada de la contraseña
    const passwordKey = deriveKey(password, email.toLowerCase());
    const encryptedMasterKey = encrypt(masterKey.toString('hex'), passwordKey);

    // 4. Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Guardar en Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        encrypted_master_key: encryptedMasterKey,
      })
      .select('id, email')
      .single();

    if (error || !user) {
      throw new Error(error?.message || 'Error al crear usuario');
    }

    // 6. Crear sesión
    const token = await createSession({
      userId: user.id,
      email: user.email,
      masterKey: masterKey.toString('hex'),
    });

    const res = NextResponse.json({
      success: true,
      seedPhrase, // Solo se envía aquí — nunca más
      user: { id: user.id, email: user.email },
    });

    res.cookies.set('eelienx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno' });
  }
}
