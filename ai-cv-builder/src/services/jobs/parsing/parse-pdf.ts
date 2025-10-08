/**
 * Step 27: PDF parser using pdfjs-dist (browser)
 */

import type { ParsedJob } from '@/types/ats.types'
import { parseJobText } from './parse-text'

/**
 * Parse PDF file to extract text and parse as job posting
 * Uses pdfjs-dist for browser-side extraction
 */
export async function parseJobPdf(
  buf: ArrayBuffer,
  meta?: { filename?: string }
): Promise<ParsedJob> {
  const pdfjs = await import('pdfjs-dist/build/pdf')

  // Configure worker (use CDN for worker script)
  // @ts-ignore - pdfjs types may not match exactly
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`

  const loadingTask = pdfjs.getDocument({ data: buf })
  const doc = await loadingTask.promise

  let text = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // @ts-ignore - content items have 'str' property
    const line = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ')
    text += ' ' + line
  }

  // Fix common PDF issues: hyphenation, extra spaces
  const normalized = fixHyphenation(text)

  return parseJobText(normalized, { filename: meta?.filename })
}

/**
 * Fix hyphenation at line breaks (e.g., "devel- opment" -> "development")
 */
function fixHyphenation(t: string): string {
  return t
    .replace(/(\w)-\s+(\w)/g, '$1$2') // Remove hyphens at line breaks
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
}
