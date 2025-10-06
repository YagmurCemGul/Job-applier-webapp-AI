/**
 * Minimal AES-GCM wrapper to protect tokens at rest (demo key)
 * In production, store tokens server-side
 */

const TEXT_ENCODER = new TextEncoder()
const TEXT_DECODER = new TextDecoder()

export async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: TEXT_ENCODER.encode('jobpilot'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptJSON(obj: any, passphrase: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase)
  const data = TEXT_ENCODER.encode(JSON.stringify(obj))
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  return btoa(
    JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(buf)),
    })
  )
}

export async function decryptJSON(blobB64: string, passphrase: string): Promise<any> {
  const blob = JSON.parse(atob(blobB64)) as { iv: number[]; data: number[] }
  const key = await deriveKey(passphrase)
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(blob.iv) },
    key,
    new Uint8Array(blob.data)
  )

  return JSON.parse(TEXT_DECODER.decode(buf))
}
