/**
 * Crypto service for encrypting/decrypting OAuth tokens
 * Uses AES-GCM with PBKDF2 key derivation (demo implementation)
 * In production, store tokens server-side with proper key management
 */

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

/**
 * Derive encryption key from passphrase using PBKDF2
 */
export async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: TEXT_ENCODER.encode('jobpilot'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt object to base64 string
 */
export async function encryptJSON(obj: any, passphrase: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase);
  const data = TEXT_ENCODER.encode(JSON.stringify(obj));
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  
  return btoa(JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(buf))
  }));
}

/**
 * Decrypt base64 string to object
 */
export async function decryptJSON(blobB64: string, passphrase: string): Promise<any> {
  const blob = JSON.parse(atob(blobB64)) as { iv: number[]; data: number[] };
  const key = await deriveKey(passphrase);
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(blob.iv) },
    key,
    new Uint8Array(blob.data)
  );
  
  return JSON.parse(TEXT_DECODER.decode(buf));
}
