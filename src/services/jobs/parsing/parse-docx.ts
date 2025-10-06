import type { ParsedJob } from '@/types/ats.types'
import { parseJobText } from './parse-text'

/**
 * Parse job posting from DOCX
 * Uses mammoth for conversion to HTML, then extracts text
 */
export async function parseJobDocx(
  buf: ArrayBuffer,
  meta?: { filename?: string }
): Promise<ParsedJob> {
  try {
    const mammoth = await import('mammoth/mammoth.browser')

    const { value } = await mammoth.convertToHtml(
      { arrayBuffer: buf },
      {
        styleMap: ["p[style-name='List Paragraph'] => ul > li:fresh"],
      }
    )

    // Convert HTML to plain text
    const html = `<div>${value}</div>`
    const { parseJobHtml } = await import('./parse-html')

    return parseJobHtml(html, { site: 'docx', url: meta?.filename })
  } catch (error) {
    console.error('DOCX parsing failed:', error)
    // Fallback: return minimal parsed job
    return parseJobText('DOCX parsing failed', { filename: meta?.filename })
  }
}
