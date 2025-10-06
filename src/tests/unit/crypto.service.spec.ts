import { describe, it, expect } from 'vitest'
import { encryptJSON, decryptJSON } from '@/services/security/crypto.service'

describe('crypto.service', () => {
  it('should encrypt and decrypt JSON', async () => {
    const data = { token: 'secret123', expires: 3600 }
    const passphrase = 'test-passphrase'

    const encrypted = await encryptJSON(data, passphrase)
    expect(encrypted).toBeDefined()
    expect(typeof encrypted).toBe('string')

    const decrypted = await decryptJSON(encrypted, passphrase)
    expect(decrypted).toEqual(data)
  })

  it('should fail with wrong passphrase', async () => {
    const data = { token: 'secret123' }
    const passphrase = 'correct-passphrase'
    const wrongPassphrase = 'wrong-passphrase'

    const encrypted = await encryptJSON(data, passphrase)

    await expect(decryptJSON(encrypted, wrongPassphrase)).rejects.toThrow()
  })

  it('should handle complex objects', async () => {
    const data = {
      access_token: 'ya29.a0AfH6SMBx...',
      refresh_token: '1//0gH...',
      expires_in: 3599,
      scope: 'gmail.send calendar.events',
      token_type: 'Bearer',
      obtained_at: Date.now(),
    }
    const passphrase = 'complex-pass'

    const encrypted = await encryptJSON(data, passphrase)
    const decrypted = await decryptJSON(encrypted, passphrase)

    expect(decrypted).toEqual(data)
  })
})
