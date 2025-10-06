/**
 * Gmail integration types
 */

export type GmailSendStatus = 'pending' | 'sent' | 'failed' | 'scheduled'

export interface GmailAccount {
  id: string // account email
  displayName?: string
  connectedAt: string
  tokenEncrypted: string // encrypted access/refresh token blob (JSON string)
  dryRun: boolean
  dailyLimit: number // user-configurable cap to stay below Gmail limits
  lastSentAt?: string
}

export interface OutboxMessage {
  id: string // uuid
  threadId?: string
  accountId: string // GmailAccount.id
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    mimeType: string
    dataBase64?: string
    url?: string
  }>
  status: GmailSendStatus
  error?: string
  createdAt: string
  scheduledFor?: string
  sentAt?: string
  headers?: Record<string, string>
  tracking?: {
    openId?: string
    clickId?: string
    pixelUrl?: string
  }
}

export interface GmailThread {
  id: string
  subject: string
  participants: string[]
  snippet: string
  messages: Array<{
    id: string
    from: string
    to: string[]
    date: string
    html?: string
    text?: string
    subject?: string
  }>
  updatedAt: string
}
