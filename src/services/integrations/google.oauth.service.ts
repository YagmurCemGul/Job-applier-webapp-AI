import { encryptJSON, decryptJSON } from '@/services/security/crypto.service'
import { useEmailAccountsStore } from '@/store/emailAccountsStore'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ')

declare global {
  interface Window {
    __gisLoaded?: boolean
    google?: any
  }
}

/**
 * Initialize Google Identity Services
 * Loads script once
 */
export async function initGIS(clientId: string): Promise<void> {
  if (window.__gisLoaded) return

  await new Promise<void>((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.onload = () => resolve()
    document.head.appendChild(s)
  })

  window.__gisLoaded = true
}

/**
 * Connect account via OAuth popup
 * Stores encrypted tokens
 */
export async function connectGoogleAccount(opts: {
  clientId: string
  passphrase: string
  dryRun?: boolean
}): Promise<void> {
  await initGIS(opts.clientId)

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: opts.clientId,
      scope: SCOPES,
      prompt: 'consent',
      callback: async (resp: any) => {
        try {
          if (!resp?.access_token) {
            throw new Error('OAuth failed - no access token')
          }

          // Get user info
          const user = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${resp.access_token}` },
          }).then((r) => r.json())

          // Encrypt and store token
          const blob = await encryptJSON(
            {
              access_token: resp.access_token,
              expires_in: 3599,
              obtained_at: Date.now(),
            },
            opts.passphrase
          )

          useEmailAccountsStore.getState().upsert({
            id: user.email,
            displayName: user.name,
            tokenEncrypted: blob,
            connectedAt: new Date().toISOString(),
            dryRun: opts.dryRun ?? true,
            dailyLimit: 90,
          })

          resolve()
        } catch (error) {
          reject(error)
        }
      },
    })

    tokenClient.requestAccessToken()
  })
}

/**
 * Get a valid bearer token
 * Refreshes if needed
 */
export async function getBearer(
  accountId: string,
  passphrase: string,
  clientId: string
): Promise<string> {
  const acc = useEmailAccountsStore.getState().items.find((a) => a.id === accountId)
  if (!acc) throw new Error('Account not found')

  const token = await decryptJSON(acc.tokenEncrypted, passphrase)
  const age = (Date.now() - token.obtained_at) / 1000

  // If token is still fresh (< 55 minutes), use it
  if (age < 3300) return token.access_token

  // Refresh token (silent)
  await initGIS(clientId)

  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      prompt: '',
      callback: async (resp: any) => {
        try {
          if (!resp?.access_token) {
            throw new Error('Token refresh failed')
          }

          const blob = await encryptJSON(
            {
              access_token: resp.access_token,
              expires_in: 3599,
              obtained_at: Date.now(),
            },
            passphrase
          )

          useEmailAccountsStore.getState().upsert({
            ...acc,
            tokenEncrypted: blob,
          })

          resolve(resp.access_token)
        } catch (error) {
          reject(error)
        }
      },
    })

    tokenClient.requestAccessToken()
  })
}
