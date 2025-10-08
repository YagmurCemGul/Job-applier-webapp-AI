/**
 * HMAC signature generation and verification
 */

export class HMACValidator {
  private encoder = new TextEncoder();

  async sign(message: string, key: string): Promise<string> {
    if (!key) {
      throw new Error('HMAC key not configured');
    }

    const cryptoKey = await this.importKey(key);
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      this.encoder.encode(message)
    );

    return this.arrayBufferToHex(signature);
  }

  async verify(message: string, signature: string, key: string): Promise<boolean> {
    if (!key) {
      return false;
    }

    try {
      const expectedSignature = await this.sign(message, key);
      return this.constantTimeCompare(signature, expectedSignature);
    } catch (error) {
      console.error('HMAC verification error:', error);
      return false;
    }
  }

  private async importKey(key: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      'raw',
      this.encoder.encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  private arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
