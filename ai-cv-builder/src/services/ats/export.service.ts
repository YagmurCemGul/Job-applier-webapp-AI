import type { ATSAnalysisResult, ATSKeywordMeta } from '@/types/ats.types'

/**
 * Export ATS analysis result as JSON blob
 * 
 * @param result - ATS analysis result
 * @returns Blob containing JSON data
 */
export function exportATSJson(result: ATSAnalysisResult): Blob {
  const json = JSON.stringify(result, null, 2)
  return new Blob([json], { type: 'application/json' })
}

/**
 * Export keywords metadata as CSV blob
 * 
 * @param meta - Keyword metadata array
 * @param matched - List of matched keywords
 * @param missing - List of missing keywords
 * @returns Blob containing CSV data
 */
export function exportKeywordsCsv(
  meta: ATSKeywordMeta[],
  matched: string[],
  missing: string[]
): Blob {
  const matchedSet = new Set(matched)
  const missingSet = new Set(missing)

  // CSV header
  const headers = [
    'term',
    'importance',
    'status',
    'inTitle',
    'inReq',
    'inQual',
    'inResp',
  ]

  // CSV rows
  const rows = meta.map((m) => {
    const status = matchedSet.has(m.term)
      ? 'matched'
      : missingSet.has(m.term)
        ? 'missing'
        : 'unknown'

    return [
      escapeCsvValue(m.term),
      m.importance.toFixed(2),
      status,
      m.inTitle ? 'yes' : 'no',
      m.inReq ? 'yes' : 'no',
      m.inQual ? 'yes' : 'no',
      m.inResp ? 'yes' : 'no',
    ].join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Escape CSV value to handle commas, quotes, and newlines
 */
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Download a blob as a file
 * 
 * @param blob - Blob to download
 * @param filename - Name of the file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Revoke the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
