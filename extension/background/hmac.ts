/**
 * HMAC signature verification
 */

export async function hmacSHA256(message: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyHMAC(
  message: string,
  signature: string,
  key: string
): Promise<boolean> {
  if (!key || !signature) return false
  const expected = await hmacSHA256(message, key)
  return expected === signature
}
