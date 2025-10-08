/**
 * Step 27: Posted/deadline date parsing (EN/TR)
 */

import type { FieldConfidence } from '@/types/ats.types'

type Lang = 'en' | 'tr' | 'unknown'

/**
 * Parse posted date and deadline date from job text
 */
export function parseDates(raw: string, lang: Lang) {
  const postedAt = parseRel(
    raw,
    lang,
    /(posted|yayınlanma|published)\s*(\d+)\s*(day|week|month|gün|hafta|ay)s?\s*ago/i
  )
  const deadlineAt = parseAbs(
    raw,
    /(deadline|son başvuru|apply by|expires?)\s*[:\-]?\s*(\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/i
  )

  return { postedAt, deadlineAt }
}

/**
 * Parse relative date (e.g., "posted 3 days ago")
 */
function parseRel(raw: string, lang: Lang, re: RegExp): FieldConfidence<Date> | undefined {
  const m = raw.match(re)
  if (!m || !m[2] || !m[3]) return undefined

  const n = Number(m[2])
  const u = m[3].toLowerCase()
  const d = new Date()

  if (u.startsWith('day') || u.startsWith('gün')) d.setDate(d.getDate() - n)
  else if (u.startsWith('week') || u.startsWith('hafta')) d.setDate(d.getDate() - n * 7)
  else if (u.startsWith('month') || u.startsWith('ay')) d.setMonth(d.getMonth() - n)
  else return undefined

  return { value: d, confidence: 0.6 }
}

/**
 * Parse absolute date (e.g., "deadline: 31.12.2024")
 */
function parseAbs(raw: string, re: RegExp): FieldConfidence<Date> | undefined {
  const m = raw.match(re)
  if (!m || !m[2]) return undefined

  // Normalize separators: . and / to -
  const dateStr = m[2].replace(/\./g, '-').replace(/\//g, '-')
  
  // Try parsing with different formats
  let dt = new Date(dateStr)
  
  // If invalid, try swapping day/month for DD/MM/YYYY format
  if (isNaN(+dt)) {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      // Try DD-MM-YYYY -> YYYY-MM-DD
      dt = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    }
  }

  if (isNaN(+dt)) return undefined
  return { value: dt, confidence: 0.8 }
}
