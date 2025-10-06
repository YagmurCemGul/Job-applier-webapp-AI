import type { OutboxMessage, GmailThread } from '@/types/gmail.types'

/**
 * Base64 URL-safe encoding
 */
function base64UrlEncode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * RFC 2822 date format
 */
function rfc2822Date(d = new Date()): string {
  return d.toUTCString()
}

/**
 * Build raw RFC 822 MIME message with optional attachments
 */
export function buildMime(msg: OutboxMessage): string {
  const boundary = 'mime_boundary_' + Math.random().toString(36).slice(2)

  const headers = [
    `From: ${msg.accountId}`,
    `To: ${msg.to.join(', ')}`,
    msg.cc?.length ? `Cc: ${msg.cc.join(', ')}` : '',
    msg.bcc?.length ? `Bcc: ${msg.bcc.join(', ')}` : '',
    `Subject: ${msg.subject}`,
    `Date: ${rfc2822Date()}`,
    `MIME-Version: 1.0`,
    msg.attachments?.length
      ? `Content-Type: multipart/mixed; boundary="${boundary}"`
      : `Content-Type: text/html; charset="UTF-8"`,
  ]
    .filter(Boolean)
    .join('\r\n')

  if (!msg.attachments?.length) {
    return base64UrlEncode(`${headers}\r\n\r\n${msg.html}`)
  }

  const parts = [`--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${msg.html}`]

  for (const a of msg.attachments ?? []) {
    if (!a.dataBase64) continue

    parts.push(
      [
        `--${boundary}`,
        `Content-Type: ${a.mimeType}; name="${a.filename}"`,
        `Content-Transfer-Encoding: base64`,
        `Content-Disposition: attachment; filename="${a.filename}"`,
        ``,
        a.dataBase64,
      ].join('\r\n')
    )
  }

  parts.push(`--${boundary}--`)

  return base64UrlEncode(`${headers}\r\n\r\n${parts.join('\r\n')}`)
}

/**
 * Send message via Gmail API
 */
export async function gmailSend(
  bearer: string,
  msg: OutboxMessage
): Promise<{ id: string; threadId: string }> {
  const raw = buildMime(msg)

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Gmail send failed: ${res.status} - ${error}`)
  }

  const data = await res.json()
  return { id: data.id as string, threadId: data.threadId as string }
}

/**
 * Fetch a thread with messages
 */
export async function gmailGetThread(bearer: string, threadId: string): Promise<GmailThread> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    {
      headers: { Authorization: `Bearer ${bearer}` },
    }
  )

  if (!res.ok) {
    throw new Error('Thread fetch failed')
  }

  const data = await res.json()

  const msgs = (data.messages ?? []).map((m: any) => {
    const headers = (m.payload?.headers ?? []) as Array<{
      name: string
      value: string
    }>
    const subject = headers.find((h) => h.name === 'Subject')?.value ?? ''
    const from = headers.find((h) => h.name === 'From')?.value ?? ''
    const to = (headers.find((h) => h.name === 'To')?.value ?? '').split(/\s*,\s*/).filter(Boolean)

    return {
      id: m.id,
      from,
      to,
      date: new Date(Number(m.internalDate)).toISOString(),
      html: decodePart(m.payload) ?? undefined,
      text: undefined,
      subject,
    }
  })

  return {
    id: data.id,
    subject: msgs[0]?.subject ?? '',
    participants: Array.from(new Set(msgs.flatMap((m) => [m.from, ...m.to]))),
    snippet: data.snippet ?? '',
    messages: msgs,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Decode email part (extract HTML body)
 */
function decodePart(payload: any): string | null {
  if (!payload) return null

  const parts = collectParts(payload)
  const html = parts.find((p) => p.mimeType?.includes('text/html'))?.body?.data

  if (!html) return null

  const str = atob(html.replace(/-/g, '+').replace(/_/g, '/'))
  return decodeURIComponent(escape(str))
}

/**
 * Collect all parts from payload (recursive)
 */
function collectParts(p: any, acc: any[] = []): any[] {
  if (!p) return acc
  acc.push(p)
  ;(p.parts ?? []).forEach((x: any) => collectParts(x, acc))
  return acc
}
