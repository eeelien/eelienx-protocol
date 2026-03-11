import crypto from 'crypto';

// ─── AES-256-GCM encrypt/decrypt ─────────────────────────────────────────────

export function encrypt(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return JSON.stringify({ iv: iv.toString('hex'), encrypted, authTag });
}

export function decrypt(encryptedJson: string, key: Buffer): string {
  const { iv, encrypted, authTag } = JSON.parse(encryptedJson);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Derivar llave de 32 bytes desde contraseña + salt ───────────────────────

export function deriveKey(password: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256');
}

// ─── Llave de env (para compatibilidad legacy) ───────────────────────────────

export function getEnvKey(): Buffer {
  const k = (process.env.ENCRYPTION_KEY || 'eelienx-dev-key-32chars-padded!!').slice(0, 32);
  return Buffer.from(k, 'utf-8');
}
