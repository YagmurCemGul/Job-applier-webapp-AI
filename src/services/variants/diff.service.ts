import type { CVData } from '@/types/cvData.types'
import type { VariantDiff, DiffBlock, DiffChange } from '@/types/variants.types'

/**
 * Compute a structured diff between two CVData objects
 * String-based for sections; array-aware for experience/education
 */
export function computeDiff(before: CVData, after: CVData): VariantDiff {
  const diff: VariantDiff = {}
  diff.summary = textBlock('summary', before.summary ?? '', after.summary ?? '')
  diff.skills = textBlock(
    'skills',
    (before.skills ?? []).map((s) => s.name).join(', '),
    (after.skills ?? []).map((s) => s.name).join(', ')
  )
  diff.contact = textBlock('contact', contactText(before), contactText(after))
  diff.experience = diffArray(before.experience ?? [], after.experience ?? [], 'experience')
  diff.education = diffArray(before.education ?? [], after.education ?? [], 'education')
  return diff
}

function textBlock(path: string, a: string, b: string): DiffBlock {
  const change: DiffChange =
    a === b ? 'unchanged' : !a && b ? 'added' : a && !b ? 'removed' : 'modified'
  return { path, before: a, after: b, change, inline: inlineDiff(a, b) }
}

function contactText(cv: CVData) {
  return [
    cv.personalInfo.fullName,
    cv.personalInfo.email,
    cv.personalInfo.phone,
    cv.personalInfo.location,
  ]
    .filter(Boolean)
    .join(' | ')
}

function diffArray(a: any[], b: any[], basePath: string): DiffBlock[] {
  const max = Math.max(a.length, b.length)
  const out: DiffBlock[] = []
  for (let i = 0; i < max; i++) {
    const before = a[i]?.description ?? stringify(a[i])
    const after = b[i]?.description ?? stringify(b[i])
    const change: DiffChange =
      !a[i] && b[i]
        ? 'added'
        : a[i] && !b[i]
          ? 'removed'
          : before === after
            ? 'unchanged'
            : 'modified'
    out.push({
      path: `${basePath}.${i}.description`,
      before,
      after,
      change,
      inline: inlineDiff(before, after),
    })
  }
  return out
}

function stringify(x: any): string {
  try {
    return JSON.stringify(x)
  } catch {
    return String(x ?? '')
  }
}

/**
 * Very small inline diff: LCS words, classify added/removed/unchanged
 */
function inlineDiff(a: string, b: string): Array<{ text: string; change: DiffChange }> {
  const aw = words(a)
  const bw = words(b)
  const lcs = computeLCS(aw, bw)
  const seq: Array<{ text: string; change: DiffChange }> = []
  let i = 0
  let j = 0

  for (const w of lcs) {
    while (aw[i] !== w && i < aw.length) {
      seq.push({ text: aw[i++] + ' ', change: 'removed' })
    }
    while (bw[j] !== w && j < bw.length) {
      seq.push({ text: bw[j++] + ' ', change: 'added' })
    }
    seq.push({ text: w + ' ', change: 'unchanged' })
    i++
    j++
  }
  while (i < aw.length) {
    seq.push({ text: aw[i++] + ' ', change: 'removed' })
  }
  while (j < bw.length) {
    seq.push({ text: bw[j++] + ' ', change: 'added' })
  }
  return seq
}

function words(s: string): string[] {
  return (s || '').split(/\s+/).filter(Boolean)
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const out: string[] = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.unshift(a[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  return out
}
