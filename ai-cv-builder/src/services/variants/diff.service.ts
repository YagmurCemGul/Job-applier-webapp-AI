import type { VariantDiff, DiffBlock, DiffChange } from '@/types/variants.types'
import type { CVData } from '@/types/cvData.types'

/**
 * Compute a structured diff between two CVData objects.
 * String-based for sections; array-aware for experience/education.
 */
export function computeDiff(before: CVData, after: CVData): VariantDiff {
  const diff: VariantDiff = {}
  
  // Summary diff
  diff.summary = textBlock('summary', before.summary ?? '', after.summary ?? '')
  
  // Skills diff
  diff.skills = textBlock(
    'skills',
    (before.skills ?? []).map(s => s.name).join(', '),
    (after.skills ?? []).map(s => s.name).join(', ')
  )
  
  // Contact diff
  diff.contact = textBlock('contact', contactText(before), contactText(after))
  
  // Experience diff
  diff.experience = diffArray(
    before.experience ?? [],
    after.experience ?? [],
    'experience'
  )
  
  // Education diff
  diff.education = diffArray(
    before.education ?? [],
    after.education ?? [],
    'education'
  )
  
  return diff
}

/**
 * Create a text-based diff block
 */
function textBlock(path: string, a: string, b: string): DiffBlock {
  const change: DiffChange =
    a === b
      ? 'unchanged'
      : !a && b
      ? 'added'
      : a && !b
      ? 'removed'
      : 'modified'
  
  return {
    path,
    before: a,
    after: b,
    change,
    inline: inlineDiff(a, b),
  }
}

/**
 * Extract contact info as text for diffing
 */
function contactText(cv: CVData): string {
  const info = cv.personalInfo
  return [
    `${info.firstName} ${info.middleName ?? ''} ${info.lastName}`.trim(),
    info.email,
    info.phone,
    info.location?.city,
    info.location?.country,
  ]
    .filter(Boolean)
    .join(' | ')
}

/**
 * Diff arrays (experience/education)
 */
function diffArray(a: any[], b: any[], basePath: string): DiffBlock[] {
  const max = Math.max(a.length, b.length)
  const out: DiffBlock[] = []
  
  for (let i = 0; i < max; i++) {
    const before = a[i]?.description ?? stringify(a[i])
    const after = b[i]?.description ?? stringify(b[i])
    
    const change: DiffChange = !a[i] && b[i]
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

/**
 * Stringify object for display
 */
function stringify(x: any): string {
  if (!x) return ''
  try {
    return JSON.stringify(x)
  } catch {
    return String(x ?? '')
  }
}

/**
 * Compute inline word-level diff using LCS
 */
function inlineDiff(
  a: string,
  b: string
): Array<{ text: string; change: DiffChange }> {
  const aw = words(a)
  const bw = words(b)
  const lcs = computeLCS(aw, bw)
  
  const seq: Array<{ text: string; change: DiffChange }> = []
  let i = 0
  let j = 0
  
  for (const w of lcs) {
    // Add removed words
    while (aw[i] !== w && i < aw.length) {
      seq.push({ text: aw[i++] + ' ', change: 'removed' })
    }
    // Add added words
    while (bw[j] !== w && j < bw.length) {
      seq.push({ text: bw[j++] + ' ', change: 'added' })
    }
    // Add unchanged word
    seq.push({ text: w + ' ', change: 'unchanged' })
    i++
    j++
  }
  
  // Add remaining removed words
  while (i < aw.length) {
    seq.push({ text: aw[i++] + ' ', change: 'removed' })
  }
  
  // Add remaining added words
  while (j < bw.length) {
    seq.push({ text: bw[j++] + ' ', change: 'added' })
  }
  
  return seq
}

/**
 * Split text into words
 */
function words(s: string): string[] {
  return (s || '').split(/\s+/).filter(Boolean)
}

/**
 * Compute Longest Common Subsequence for word-level diff
 */
function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  
  // Backtrack to find LCS
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
