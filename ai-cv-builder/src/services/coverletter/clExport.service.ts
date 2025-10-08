/**
 * Cover Letter Export Service - Step 30
 * Handles export to PDF/DOCX/Google Doc with professional naming
 */

import { toPlain } from './clVariables.service'
import type { CoverLetterDoc } from '@/types/coverLetter.types'
import type { ExportFormat, RenderContext } from '@/types/export.types'
import { renderFilename } from '@/services/variants/naming.service'

/**
 * Export cover letter in specified format
 */
export async function exportCoverLetter(
  doc: CoverLetterDoc,
  fmt: ExportFormat
): Promise<void> {
  // Build context for filename rendering
  const nameParts = (doc.variables?.['YourName'] ?? '').split(' ')
  const ctx: RenderContext = {
    FirstName: nameParts[0],
    LastName: nameParts.slice(1).join(' '),
    Role: doc.variables?.['Role'],
    Company: doc.variables?.['Company'],
    Date: new Date().toISOString().slice(0, 10),
    JobId: doc.meta.linkedJobId,
    VariantName: doc.meta.linkedVariantId,
    Locale: doc.lang,
  }

  const baseFilename = renderFilename(
    'CoverLetter_{FirstName}_{LastName}_{Company}_{Role}_{Date}',
    ctx
  )
  const filename =
    baseFilename + (fmt === 'pdf' ? '.pdf' : fmt === 'docx' ? '.docx' : '.gdoc')

  if (fmt === 'pdf') {
    await exportToPDF(doc.content, filename, doc.lang)
  } else if (fmt === 'docx') {
    await exportToDOCX(doc.content, filename, doc.lang)
  } else {
    await exportToGoogleDoc(toPlain(doc.content), filename, doc.lang)
  }
}

/**
 * Export to PDF
 */
async function exportToPDF(
  html: string,
  filename: string,
  lang: string
): Promise<void> {
  try {
    // Try to use existing export service
    const { exportHTMLToPDF } = await import('@/services/export.service')
    await exportHTMLToPDF(html, filename, lang)
  } catch (e) {
    console.warn('PDF export service not available, using fallback')
    // Fallback: create a simple download
    const blob = new Blob([html], { type: 'text/html' })
    downloadBlob(blob, filename.replace('.pdf', '.html'))
  }
}

/**
 * Export to DOCX
 */
async function exportToDOCX(
  html: string,
  filename: string,
  lang: string
): Promise<void> {
  try {
    const { exportHTMLToDOCX } = await import('@/services/export.service')
    await exportHTMLToDOCX(html, filename, lang)
  } catch (e) {
    console.warn('DOCX export service not available, using fallback')
    const blob = new Blob([html], { type: 'text/html' })
    downloadBlob(blob, filename.replace('.docx', '.html'))
  }
}

/**
 * Export to Google Doc
 */
async function exportToGoogleDoc(
  text: string,
  filename: string,
  lang: string
): Promise<void> {
  try {
    const { exportHTMLToGoogleDoc } = await import('@/services/export.service')
    await exportHTMLToGoogleDoc(text, filename, lang)
  } catch (e) {
    console.warn('Google Doc export not available, using text download')
    const blob = new Blob([text], { type: 'text/plain' })
    downloadBlob(blob, filename.replace('.gdoc', '.txt'))
  }
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
