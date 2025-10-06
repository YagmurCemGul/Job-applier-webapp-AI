/**
 * Gmail integration (stub)
 * - If VITE_GMAIL_ENABLED === '1', call backend endpoint /api/gmail/send
 * - Else, simulate success and log locally
 */
export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  inReplyToId?: string
}): Promise<{ ok: boolean; id: string }> {
  if (import.meta.env.VITE_GMAIL_ENABLED === '1') {
    const r = await fetch('/api/gmail/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts)
    })
    if (!r.ok) throw new Error('Gmail send failed')
    return await r.json()
  }

  // Local stub
  return { ok: true, id: `local-${Date.now()}` }
}
