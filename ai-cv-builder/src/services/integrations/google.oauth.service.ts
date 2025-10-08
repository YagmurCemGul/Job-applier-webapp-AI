/**
 * Google OAuth service using Google Identity Services (GIS)
 * Handles token acquisition, refresh, and storage
 */
import { encryptJSON, decryptJSON } from '@/services/security/crypto.service';
import { useEmailAccounts } from '@/stores/emailAccounts.store';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

declare global {
  interface Window {
    __gisLoaded?: boolean;
    google?: any;
  }
}

/**
 * Initialize Google Identity Services script
 * Loads script once and reuses for subsequent calls
 */
export async function initGIS(clientId: string): Promise<void> {
  if (window.__gisLoaded) return;
  
  await new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  
  window.__gisLoaded = true;
}

/**
 * Connect Google account via OAuth popup
 * Stores encrypted tokens in emailAccounts store
 */
export async function connectGoogleAccount(opts: {
  clientId: string;
  passphrase: string;
  dryRun?: boolean;
}): Promise<void> {
  await initGIS(opts.clientId);
  
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: opts.clientId,
      scope: SCOPES,
      prompt: 'consent',
      callback: async (resp: any) => {
        try {
          if (!resp?.access_token) {
            reject(new Error('OAuth failed: no access token'));
            return;
          }

          // Fetch user info
          const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${resp.access_token}` }
          });
          const user = await userRes.json();

          // Encrypt and store token
          const blob = await encryptJSON(
            {
              access_token: resp.access_token,
              expires_in: 3599,
              obtained_at: Date.now()
            },
            opts.passphrase
          );

          useEmailAccounts.getState().upsert({
            id: user.email,
            displayName: user.name,
            tokenEncrypted: blob,
            connectedAt: new Date().toISOString(),
            dryRun: opts.dryRun ?? true,
            dailyLimit: 90
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });

    tokenClient.requestAccessToken();
  });
}

/**
 * Get valid bearer token for account
 * Refreshes token if expired (demo uses silent refresh)
 */
export async function getBearer(
  accountId: string,
  passphrase: string,
  clientId: string
): Promise<string> {
  const acc = useEmailAccounts.getState().getById(accountId);
  if (!acc) throw new Error('Account not found');

  const token = await decryptJSON(acc.tokenEncrypted, passphrase);
  const age = (Date.now() - token.obtained_at) / 1000;

  // Token still valid (with 5min buffer)
  if (age < 3300) return token.access_token;

  // Refresh token
  await initGIS(clientId);

  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      prompt: '',
      callback: async (resp: any) => {
        try {
          if (!resp?.access_token) {
            reject(new Error('Token refresh failed'));
            return;
          }

          const blob = await encryptJSON(
            {
              access_token: resp.access_token,
              expires_in: 3599,
              obtained_at: Date.now()
            },
            passphrase
          );

          useEmailAccounts.getState().upsert({ ...acc, tokenEncrypted: blob });
          resolve(resp.access_token);
        } catch (error) {
          reject(error);
        }
      }
    });

    tokenClient.requestAccessToken();
  });
}
