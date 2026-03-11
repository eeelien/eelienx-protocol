import * as bip39 from 'bip39';

// Genera 12 palabras en español usando wordlist en inglés (estándar BIP-39)
export function generateSeedPhrase(): string {
  return bip39.generateMnemonic(128); // 128 bits = 12 palabras
}

// Deriva una llave de 32 bytes desde la frase semilla
export async function deriveMasterKeyFromPhrase(phrase: string): Promise<Buffer> {
  const seed = await bip39.mnemonicToSeed(phrase);
  return seed.subarray(0, 32); // primeros 32 bytes = llave AES-256
}

export function validatePhrase(phrase: string): boolean {
  return bip39.validateMnemonic(phrase);
}
