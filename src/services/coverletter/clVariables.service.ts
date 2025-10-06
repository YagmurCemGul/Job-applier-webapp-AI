import DOMPurify from 'isomorphic-dompurify'
import type { CVData } from '@/types/cvData.types'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'data-*', 'style'],
  })
}

export function buildVariables(opts: {
  cv: CVData
  job?: { title?: string; company?: string; recruiterName?: string }
  extra?: Record<string, string>
}): Record<string, string> {
  const vars: Record<string, string> = {
    Company: opts.job?.company ?? '',
    Role: opts.job?.title ?? '',
    RecruiterName: opts.job?.recruiterName ?? 'Hiring Manager',
    YourName: opts.cv?.personalInfo?.fullName ?? '',
    Skills: deriveSkills(opts.cv),
    WhyUs: '',
    Closing: 'Thank you for considering my application.',
  }
  return { ...vars, ...(opts.extra ?? {}) }
}

function deriveSkills(cv: CVData): string {
  const skills = (cv.skills ?? []).slice(0, 8).map((s) => s.name)
  const base = skills.join(', ')
  return base ? `Key strengths include ${base}.` : ''
}

export function toPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}
