import type { ParsedJob } from '@/types/ats.types'
import { parseJobText } from './parse-text'
import { fixHyphenation } from './normalize'

/**
 * Parse job posting from PDF
 * Uses pdfjs-dist for browser-side PDF text extraction
 */
export async function parseJobPdf(
  buf: ArrayBuffer,
  meta?: { filename?: string }
): Promise<ParsedJob> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf')

    // Configure worker (CDN fallback)
    if (typeof window !== 'undefined') {
      const pdfjsLib = pdfjs as any
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`
    }

    const loadingTask = pdfjs.getDocument({ data: buf })
    const doc = await loadingTask.promise

    let text = ''
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const line = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ')
      text += ' ' + line
    }

    const normalized = fixHyphenation(text)
    return parseJobText(normalized, { filename: meta?.filename })
  } catch (error) {
    console.error('PDF parsing failed:', error)
    // Fallback: return minimal parsed job
    return parseJobText('PDF parsing failed', { filename: meta?.filename })
  }
}
