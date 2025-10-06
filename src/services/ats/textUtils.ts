import type { ATSTarget, ATSActionType } from '@/types/ats.types'
import type { CVData } from '@/types/cvData.types'

/**
 * Normalize text for comparison (remove diacritics, lowercase, trim)
 */
export function normalizeText(t: string): string {
  return t
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tokenize text into words
 */
export function tokenize(t: string): string[] {
  return normalizeText(t)
    .split(/[^a-z0-9ğüşöçıİ]+/i)
    .filter(Boolean)
}

/**
 * Detect language based on character distribution
 */
export function detectLang(t: string): 'en' | 'tr' | 'unknown' {
  const n = normalizeText(t)
  const trHits = (n.match(/[ğüşöçıİ]/gi) || []).length
  const enHits = (n.match(/[a-z]/gi) || []).length
  if (trHits > 0 && trHits * 3 > enHits) return 'tr'
  if (enHits > 0) return 'en'
  return 'unknown'
}

/**
 * Update nested CVData by target + action
 */
export function updateByPath(
  draft: CVData,
  target: ATSTarget,
  action: { type: ATSActionType; payload?: unknown }
) {
  const section = target.section
  if (!section) return

  switch (action.type) {
    case 'add': {
      if (section === 'summary') {
        const text = String((action.payload as any)?.text ?? '')
        const current = (draft as any).summary ?? ''
        const joined = [current, text].filter(Boolean).join(' ')
        ;(draft as any).summary = joined.trim()
      }
      break
    }
    case 'replace': {
      if (target.path) {
        const parent = getParent(draft, target.path.slice(0, -1))
        const key = target.path[target.path.length - 1]
        if (parent && key) {
          ;(parent as any)[key] = (action.payload as any)?.text ?? ''
        }
      }
      break
    }
    case 'remove': {
      if (target.path) {
        const parent = getParent(draft, target.path.slice(0, -1))
        const key = target.path[target.path.length - 1]
        if (parent && key) {
          if (Array.isArray(parent)) {
            parent.splice(Number(key), 1)
          } else {
            delete (parent as any)[key]
          }
        }
      }
      break
    }
  }
}

function getParent(root: any, path: string[]) {
  if (!path || path.length === 0) return root
  return path.reduce((acc, key) => (acc ? acc[key] : undefined), root)
}
