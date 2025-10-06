type Lang = 'en' | 'tr' | 'unknown'

/**
 * Section header patterns for EN and TR
 */
const HEADERS = {
  en: {
    summary: [/summary|about the role|about us|job description/i],
    responsibilities: [/responsibilities|what you will do|your role|duties/i],
    requirements: [/requirements|what you bring|must have|required skills/i],
    qualifications: [/qualifications|nice to have|preferred|bonus/i],
    benefits: [/benefits|perks|what we offer/i],
  },
  tr: {
    summary: [/özet|pozisyon hakkında|hakkımızda|iş tanımı/i],
    responsibilities: [/görevler|sorumluluklar|ne yapacaksın|yapılacaklar/i],
    requirements: [/gereksinimler|aranan nitelikler|şartlar|zorunlu/i],
    qualifications: [/nitelikler|tercihen|artı|bonus/i],
    benefits: [/yan haklar|avantajlar|sunduklarımız/i],
  },
}

/**
 * Split raw text into sections
 */
export function splitSections(raw: string, lang: Lang) {
  const L = lang === 'tr' ? HEADERS.tr : HEADERS.en

  const sectionize = (reArr: RegExp[]) => {
    for (const re of reArr) {
      const match = raw.match(new RegExp(`${re.source}[\\s\\S]*?(?=\\n\\s*\\n|$)`, re.flags))
      if (match) {
        return normalizeBlock(match[0].replace(re, '').trim())
      }
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

function normalizeBlock(s?: string): string | undefined {
  return s?.replace(/\s+\n/g, '\n').trim()
}

function bullets(s?: string): string[] | undefined {
  if (!s) return undefined
  return s
    .split(/\r?\n/)
    .map((x) => x.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}
