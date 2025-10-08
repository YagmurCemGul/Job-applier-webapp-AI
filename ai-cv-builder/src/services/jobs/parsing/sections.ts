/**
 * Step 27: Section splitting & header detection (EN/TR)
 */

type Lang = 'en' | 'tr' | 'unknown'

/** Header patterns for different sections (EN/TR) */
const HEADERS = {
  en: {
    summary: [
      /summary/i,
      /about the role/i,
      /about us/i,
      /overview/i,
      /description/i,
      /role description/i,
    ],
    responsibilities: [
      /responsibilities/i,
      /what you will do/i,
      /what you'll do/i,
      /your role/i,
      /duties/i,
      /key responsibilities/i,
    ],
    requirements: [
      /requirements/i,
      /what you bring/i,
      /must have/i,
      /required/i,
      /minimum qualifications/i,
      /what we're looking for/i,
    ],
    qualifications: [
      /qualifications/i,
      /nice to have/i,
      /preferred/i,
      /plus/i,
      /bonus/i,
      /preferred qualifications/i,
    ],
    benefits: [/benefits/i, /perks/i, /what we offer/i, /our benefits/i, /compensation/i],
  },
  tr: {
    summary: [
      /özet/i,
      /pozisyon hakkında/i,
      /hakkımızda/i,
      /genel bakış/i,
      /tanım/i,
      /iş tanımı/i,
    ],
    responsibilities: [
      /görevler/i,
      /sorumluluklar/i,
      /ne yapacaksın/i,
      /rolün/i,
      /sorumluluklarınız/i,
    ],
    requirements: [
      /gereksinimler/i,
      /aranan nitelikler/i,
      /şartlar/i,
      /zorunlu/i,
      /aradığımız özellikler/i,
    ],
    qualifications: [/nitelikler/i, /tercihen/i, /artı/i, /ek/i, /tercih edilen/i],
    benefits: [/yan haklar/i, /avantajlar/i, /sunduklarımız/i, /maaş/i],
  },
}

/**
 * Split raw job text into logical sections based on header detection
 */
export function splitSections(raw: string, lang: Lang) {
  const L = lang === 'tr' ? HEADERS.tr : HEADERS.en

  const sectionize = (reArr: RegExp[]) => {
    for (const re of reArr) {
      // Match from header to next double newline or end
      const m = raw.match(new RegExp(`${re.source}[\\s\\S]*?(?=\\n\\s*\\n|$)`, re.flags))
      if (m) return normalizeBlock(m[0].replace(re, '').trim())
    }
    return undefined
  }

  return {
    summary: sectionize(L.summary),
    responsibilities: bullets(sectionize(L.responsibilities)),
    requirements: bullets(sectionize(L.requirements)),
    qualifications: bullets(sectionize(L.qualifications)),
    benefits: bullets(sectionize(L.benefits)),
    raw: raw,
  }
}

/**
 * Normalize block: collapse extra whitespace/newlines
 */
function normalizeBlock(s?: string): string | undefined {
  return s?.replace(/\s+\n/g, '\n').trim()
}

/**
 * Split block into bullet points (detect common bullet characters)
 */
function bullets(s?: string): string[] | undefined {
  if (!s) return undefined
  return s
    .split(/\r?\n/)
    .map((x) => x.replace(/^[\-\*\u2022\d]+[\.\)]\s*/, '').trim())
    .filter(Boolean)
}
