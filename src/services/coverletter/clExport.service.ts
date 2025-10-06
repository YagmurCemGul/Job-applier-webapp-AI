import { renderFilename } from '@/services/variants/naming.service'
import { toPlain } from './clVariables.service'
import type { CoverLetterDoc } from '@/types/coverletter.types'
import type { ExportFormat } from '@/types/export.types'

export async function exportCoverLetter(doc: CoverLetterDoc, fmt: ExportFormat) {
  const nameParts = (doc.variables?.YourName ?? '').split(' ')

  const ctx = {
    FirstName: nameParts[0] ?? '',
    LastName: nameParts.slice(1).join(' ') ?? '',
    Role: doc.variables?.Role ?? '',
    Company: doc.variables?.Company ?? '',
    Date: new Date().toISOString().slice(0, 10),
    JobId: doc.meta.linkedJobId,
    VariantName: doc.meta.linkedVariantId,
    Locale: doc.lang,
    DocType: 'CoverLetter',
  } as any

  const filename =
    renderFilename('CoverLetter_{FirstName}_{LastName}_{Company}_{Role}_{Date}', ctx) +
    (fmt === 'pdf' ? '.pdf' : fmt === 'docx' ? '.docx' : '.gdoc')

  if (fmt === 'pdf') {
    // Stub: would call actual PDF service
    console.log(`Exporting PDF: ${filename}`)
    console.log('Content:', toPlain(doc.content))
  } else if (fmt === 'docx') {
    // Stub: would call actual DOCX service
    console.log(`Exporting DOCX: ${filename}`)
    console.log('Content:', toPlain(doc.content))
  } else {
    // Stub: would call actual Google Doc service
    console.log(`Exporting Google Doc: ${filename}`)
    console.log('Content:', toPlain(doc.content))
  }
}
