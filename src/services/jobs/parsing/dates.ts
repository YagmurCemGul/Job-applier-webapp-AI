import type { FieldConfidence } from '@/types/ats.types'

/**
 * Parse posted and deadline dates from text
 */
export function parseDates(raw: string, lang: 'en' | 'tr' | 'unknown') {
  const postedAt = parseRel(
    raw,
    lang,
    /(posted|yayınlanma|yayınlandı)\s*[:\-]?\s*(\d+)\s*(day|week|month|gün|hafta|ay)s?\s*ago/i
  )

  const deadlineAt = parseAbs(
    raw,
    /(deadline|son başvuru|apply by)\s*[:\-]?\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/i
  )

  return { postedAt, deadlineAt }
}

function parseRel(raw: string, _lang: string, re: RegExp): FieldConfidence<Date> | undefined {
  const m = raw.match(re)
  if (!m) return undefined

  const n = Number(m[2])
  const u = m[3].toLowerCase()
  const d = new Date()

  if (u.startsWith('day') || u.startsWith('gün')) {
    d.setDate(d.getDate() - n)
  } else if (u.startsWith('week') || u.startsWith('hafta')) {
    d.setDate(d.getDate() - n * 7)
  } else if (u.startsWith('month') || u.startsWith('ay')) {
    d.setMonth(d.getMonth() - n)
  }

  return { value: d, confidence: 0.6 }
}

function parseAbs(raw: string, re: RegExp): FieldConfidence<Date> | undefined {
  const m = raw.match(re)
  if (!m) return undefined

  // Try parsing the date string
  const dateStr = m[2].replace(/[\/\-]/g, '.') // Normalize separators
  const dt = new Date(dateStr)

  if (isNaN(+dt)) return undefined
  return { value: dt, confidence: 0.8 }
}
