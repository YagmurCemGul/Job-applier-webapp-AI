/**
 * Step 27: DOCX parser using mammoth
 */

import type { ParsedJob } from '@/types/ats.types'
import { parseJobText } from './parse-text'

/**
 * Parse DOCX file to extract text and parse as job posting
 * Uses mammoth for browser-side extraction
 */
export async function parseJobDocx(
  buf: ArrayBuffer,
  meta?: { filename?: string }
): Promise<ParsedJob> {
  // @ts-ignore - mammoth may not have perfect types
  const mammoth = await import('mammoth/mammoth.browser.js')

  const { value } = await mammoth.convertToHtml(
    { arrayBuffer: buf },
    {
      // Map list paragraphs to HTML lists
      styleMap: ["p[style-name='List Paragraph'] => ul > li:fresh"],
    }
  )

  // Convert HTML to plain text and reuse HTML parser pipeline
  const html = `<div>${value}</div>`
  const { parseJobHtml } = await import('./parse-html')
  return parseJobHtml(html, { site: 'docx', url: meta?.filename })
}
