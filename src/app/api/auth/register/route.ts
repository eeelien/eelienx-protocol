import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSeedPhrase, deriveMasterKeyFromPhrase } from '@/lib/seedphrase';
import { encrypt, deriveKey, generateSalt } from '@/lib/crypto';
import { createSession, encryptMasterKeyForSession, setSessionCookies } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña (mín. 8 caracteres) requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una cuenta con ese email' },
        { status: 409 }
      );
    }

    // 1. Generar frase semilla (NUNCA se guarda en DB)
    const seedPhrase = generateSeedPhrase();

    // 2. Derivar llave maestra desde frase semilla
    const masterKey = await deriveMasterKeyFromPhrase(seedPhrase);
    const masterKeyHex = masterKey.toString('hex');

    // 3. Salt aleatorio para PBKDF2 (guardado en DB, no el email)
    const pbkdfSalt = generateSalt();

    // 4. Cifrar la llave maestra con llave derivada de la contraseña + salt aleatorio
    const passwordKey = await deriveKey(password, pbkdfSalt);
    const encryptedMasterKey = encrypt(masterKeyHex, passwordKey);

    // 5. Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Guardar en Supabase (pbkdf_salt también se guarda)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        encrypted_master_key: encryptedMasterKey,
        pbkdf_salt: pbkdfSalt,
      })
      .select('id, email')
      .single();

    if (error || !user) {
      throw new Error(error?.message || 'Error al crear usuario');
    }

    // 7. Crear sesión JWT (sin masterKey) + split cookies
    const jwt = await createSession({ userId: user.id, email: user.email });
    const { encryptedMK, sessionSecret } = encryptMasterKeyForSession(masterKeyHex);

    const res = NextResponse.json({
      success: true,
      seedPhrase, // Solo se envía aquí una única vez — nunca más
      user: { id: user.id, email: user.email },
    });

    setSessionCookies(res, jwt, encryptedMK, sessionSecret);
    return res;

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    console.error('Register error:', msg);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
