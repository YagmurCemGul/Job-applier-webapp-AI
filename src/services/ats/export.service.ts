import type { ATSAnalysisResult, ATSKeywordMeta } from '@/types/ats.types'

/**
 * Export ATS analysis result as JSON
 */
export function exportATSJson(result: ATSAnalysisResult): Blob {
  const json = JSON.stringify(result, null, 2)
  return new Blob([json], { type: 'application/json' })
}

/**
 * Export keywords as CSV
 * Columns: term, importance, status, inTitle, inReq, inQual, inResp
 */
export function exportKeywordsCsv(
  meta: ATSKeywordMeta[],
  matched: string[],
  missing: string[]
): Blob {
  const matchedSet = new Set(matched.map((t) => t.toLowerCase()))
  const missingSet = new Set(missing.map((t) => t.toLowerCase()))

  // CSV header
  const rows: string[] = [
    'term,importance,status,inTitle,inReq,inQual,inResp',
  ]

  // CSV rows
  for (const m of meta) {
    const status = matchedSet.has(m.term.toLowerCase())
      ? 'matched'
      : missingSet.has(m.term.toLowerCase())
        ? 'missing'
        : 'unknown'

    rows.push(
      [
        escapeCsv(m.term),
        m.importance.toFixed(2),
        status,
        m.inTitle ? 'yes' : 'no',
        m.inReq ? 'yes' : 'no',
        m.inQual ? 'yes' : 'no',
        m.inResp ? 'yes' : 'no',
      ].join(',')
    )
  }

  const csv = rows.join('\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Escape CSV value (quote if contains comma/quote/newline)
 */
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Download blob with filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
