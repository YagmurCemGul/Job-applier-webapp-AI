/**
 * Resume Picker Service
 * Resolves CV variant and cover letter into file references for application
 */

import type { FileRef } from '@/types/apply.types';

/**
 * Pick and export files for application submission
 * @param opts - Variant and cover letter IDs
 * @returns Array of file references with URLs
 */
export async function pickFiles(opts: {
  variantId?: string;
  coverLetterId?: string;
}): Promise<FileRef[]> {
  const files: FileRef[] = [];
  
  // Export CV variant to PDF
  if (opts.variantId) {
    try {
      // Dynamic import to avoid circular dependencies
      const { exportVariantToPDF } = await import('@/services/export/variantExport.service');
      const url = await exportVariantToPDF(opts.variantId, { silent: true } as any);
      files.push({
        id: 'cv',
        name: 'CV.pdf',
        type: 'cv',
        url
      });
    } catch (error) {
      console.error('Failed to export CV variant:', error);
    }
  }
  
  // Export cover letter to PDF
  if (opts.coverLetterId) {
    try {
      const { useCoverLetterStore } = await import('@/stores/coverLetter.store');
      const doc = useCoverLetterStore.getState().items.find(
        (x: any) => x.meta.id === opts.coverLetterId
      );
      
      if (doc) {
        const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
        const fname = `CoverLetter_${Date.now()}.pdf`;
        const url = await exportHTMLToPDF(doc.content, fname, doc.lang, {
          returnUrl: true
        } as any);
        
        files.push({
          id: 'cl',
          name: fname,
          type: 'coverLetter',
          url
        });
      }
    } catch (error) {
      console.error('Failed to export cover letter:', error);
    }
  }
  
  return files;
}
