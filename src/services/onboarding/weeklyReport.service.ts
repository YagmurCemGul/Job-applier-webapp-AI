import type { OnboardingPlan } from '@/types/onboarding.types'
import type { Objective } from '@/types/okr.types'
import { objectiveProgress } from './okr.service'

/**
 * Build weekly report HTML with highlights/risks/asks
 */
export function buildWeeklyHTML(
  plan: OnboardingPlan,
  opts: {
    highlights: string[]
    risks: string[]
    asks: string[]
    okrProgress?: Array<{ title: string; pct: number }>
  }
): string {
  const rows = (title: string, items: string[]) =>
    items.length
      ? `<h3>${title}</h3><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`
      : ''

  const okrs = opts.okrProgress?.length
    ? `<h3>OKRs</h3><ul>${opts.okrProgress.map((x) => `<li>${x.title}: ${(x.pct * 100).toFixed(0)}%</li>`).join('')}</ul>`
    : ''

  return `<div><h2>${plan.company} — ${plan.role} Weekly Update</h2>${rows('Highlights', opts.highlights)}${rows('Risks', opts.risks)}${rows('Asks', opts.asks)}${okrs}<p style="color:#64748b;font-size:12px">Generated with JobPilot. Data is user-provided.</p></div>`
}

/**
 * Send weekly email via Gmail API
 */
export async function sendWeeklyEmail(
  bearer: string,
  from: string,
  to: string[],
  subject: string,
  html: string
): Promise<any> {
  const msg = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    accountId: from,
    to,
    subject,
    html,
    status: 'pending',
    createdAt: new Date().toISOString()
  } as any

  // Build RFC 822 MIME message
  const boundary = '----boundary'
  const raw = [
    `From: ${from}`,
    `To: ${to.join(', ')}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    `--${boundary}--`
  ].join('\r\n')

  const encoded = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encoded })
    }
  )

  if (!res.ok) throw new Error('Weekly send failed')

  return await res.json()
}

/**
 * Helper to compute OKR progress list for a plan
 */
export function progressForPlan(
  plan: OnboardingPlan,
  okrs: Objective[]
): Array<{ title: string; pct: number }> {
  return okrs
    .filter((o) => o.planId === plan.id)
    .map((o) => ({
      title: o.title,
      pct: objectiveProgress(o)
    }))
}
