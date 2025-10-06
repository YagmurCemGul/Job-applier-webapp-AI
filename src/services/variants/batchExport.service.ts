import type { ExportPreset, ExportFormat } from '@/types/export.types'
import type { CVData } from '@/types/cvData.types'
import { renderFilename } from './naming.service'

/**
 * Orchestrate export of a Variant CV in multiple formats with a consistent name
 */
export async function batchExport(variantId: string, preset: ExportPreset) {
  const { useVariantsStore } = require('@/store/variantsStore')
  const v = useVariantsStore.getState().items.find((x: any) => x.meta.id === variantId)
  if (!v) throw new Error('variant not found')

  const ctx = buildContext(v, preset)
  for (const fmt of preset.formats) {
    const filename = renderFilename(preset.namingTemplate, ctx) + ext(fmt)
    await exportOne(v.cv, fmt, filename, preset.locale || 'en')
  }
}

function buildContext(v: any, preset: ExportPreset) {
  const cv = v.cv
  const role = guessRole(cv)
  const company = v.meta.linkedJobId ? linkedCompany(v.meta.linkedJobId) : undefined
  const date = new Date().toISOString().slice(0, 10)

  const fullName = cv.personalInfo?.fullName || ''
  const nameParts = fullName.split(' ')

  return {
    FirstName: cv.personalInfo?.firstName || nameParts[0] || '',
    MiddleName: undefined,
    LastName: cv.personalInfo?.lastName || nameParts.slice(1).join(' ') || '',
    Role: role,
    Company: company,
    Date: date,
    JobId: v.meta.linkedJobId,
    VariantName: v.meta.name,
    Locale: preset.locale,
  }
}

function ext(fmt: ExportFormat): string {
  return fmt === 'pdf' ? '.pdf' : fmt === 'docx' ? '.docx' : '.gdoc'
}

async function exportOne(cv: CVData, fmt: ExportFormat, filename: string, locale: 'en' | 'tr') {
  // Stub implementations - these would call actual export services
  console.log(`Exporting ${filename} as ${fmt} in ${locale}`)

  if (fmt === 'pdf') {
    // const { exportCVToPDF } = await import('@/services/export/pdf.service')
    // await exportCVToPDF(cv, filename, locale)
    console.log('PDF export (stub)')
  } else if (fmt === 'docx') {
    // const { exportCVToDOCX } = await import('@/services/export/docx.service')
    // await exportCVToDOCX(cv, filename, locale)
    console.log('DOCX export (stub)')
  } else {
    // const { exportCVToGoogleDoc } = await import('@/services/export/gdoc.service')
    // await exportCVToGoogleDoc(cv, filename, locale)
    console.log('Google Doc export (stub)')
  }
}

function guessRole(cv: CVData): string | undefined {
  const s = (cv.summary ?? '').toLowerCase()
  const m = s.match(/(frontend|backend|full[\s-]?stack|product|data|marketing|designer|devops)/)
  return m?.[1]?.replace(/\s+/g, ' ')
}

function linkedCompany(jobId?: string): string | undefined {
  if (!jobId) return
  try {
    const { useJobsStore } = require('@/store/jobsStore')
    const j = useJobsStore.getState().items.find((x: any) => x.id === jobId)
    return j?.company
  } catch {
    return undefined
  }
}
