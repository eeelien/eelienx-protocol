import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    const key = process.env.ENCRYPTION_KEY || 'eelienx-dev-key-32chars-padded!!';
    const keyBuffer = Buffer.from(key, 'utf-8');

    // Encrypt with AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    const payload = JSON.stringify({ email, password });
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save encrypted credentials
    const credsPath = path.join(dataDir, 'bitso-creds.json');
    fs.writeFileSync(
      credsPath,
      JSON.stringify({
        iv: iv.toString('hex'),
        encrypted,
        authTag,
        createdAt: new Date().toISOString(),
      }),
      'utf-8'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bitso connect error:', error);
    return NextResponse.json({ success: false, message: 'Error al conectar' });
  }
}
