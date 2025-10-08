import type { ATSTarget, ATSActionType } from '@/types/ats.types'
import type { CVData } from '@/types/cvData.types'

/**
 * Normalize text for comparison (remove diacritics, lowercase, trim whitespace)
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
): void {
  const section = target.section
  if (!section) return

  switch (action.type) {
    case 'add': {
      if (section === 'summary') {
        const text = String((action.payload as any)?.text ?? '')
        const joined = [draft.summary ?? '', text].filter(Boolean).join(' ')
        ;(draft as any).summary = joined.trim()
      }
      // Extend with other sections in future steps
      break
    }
    case 'replace': {
      if (section === 'summary' && typeof draft.summary === 'string') {
        const text = String((action.payload as any)?.text ?? '')
        ;(draft as any).summary = text
      }
      break
    }
    case 'remove': {
      const parent = getParent(draft, section, target.path)
      if (parent && target.path) {
        const key = target.path.at(-1)!
        if (Array.isArray(parent)) parent.splice(Number(key), 1)
        else delete (parent as any)[key]
      }
      break
    }
    case 'reorder': {
      // For future use: move bullet points, experiences etc.
      break
    }
  }
}

/**
 * Get parent object for nested path
 */
function getParent(root: any, section: keyof CVData, path?: string[]): any {
  if (!path || path.length <= 1) return root
  const parentPath = [section as string, ...path.slice(0, -1)]
  return parentPath.reduce((acc, key) => (acc ? acc[key] : undefined), root)
}
