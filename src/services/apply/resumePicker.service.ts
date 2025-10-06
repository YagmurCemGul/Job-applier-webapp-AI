import type { FileRef } from '@/types/apply.types'

/**
 * Resume picker service
 * Returns URLs or blob refs from current Variant + CL doc
 */
export async function pickFiles(opts: {
  variantId?: string
  coverLetterId?: string
}): Promise<FileRef[]> {
  const files: FileRef[] = []

  // Variant → export to PDF silently
  if (opts.variantId) {
    try {
      // Stub: Would call actual export service
      // const { exportVariantToPDF } = await import('@/services/export/variantExport.service')
      // const url = await exportVariantToPDF(opts.variantId, { silent: true })
      const url = `blob:cv-${opts.variantId}.pdf`
      files.push({ id: 'cv', name: 'CV.pdf', type: 'cv', url })
    } catch {
      // Ignore errors
    }
  }

  // Cover Letter → export to PDF
  if (opts.coverLetterId) {
    try {
      const { useCoverLetterStore } = await import('@/store/coverLetterStore')
      const doc = useCoverLetterStore
        .getState()
        .items.find((x: any) => x.meta.id === opts.coverLetterId)

      if (doc) {
        // Stub: Would call actual export service
        // const { exportHTMLToPDF } = await import('@/services/export/pdf.service')
        // const url = await exportHTMLToPDF(doc.content, fname, doc.lang, { returnUrl: true })
        const fname = `CoverLetter_${Date.now()}.pdf`
        const url = `blob:cl-${opts.coverLetterId}.pdf`
        files.push({ id: 'cl', name: fname, type: 'coverLetter', url })
      }
    } catch {
      // Ignore errors
    }
  }

  return files
}
