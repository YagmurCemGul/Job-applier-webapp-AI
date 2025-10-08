import type { ExportPreset, ExportFormat, RenderContext } from '@/types/export.types'
import type { CVData } from '@/types/cvData.types'
import { renderFilename } from './naming.service'

/**
 * Orchestrate export of a Variant CV in multiple formats with a consistent name.
 */
export async function batchExport(variantId: string, preset: ExportPreset) {
  const { useVariantsStore } = require('@/stores/variants.store')
  const v = useVariantsStore.getState().items.find((x: any) => x.meta.id === variantId)
  
  if (!v) throw new Error('variant not found')

  const ctx = buildContext(v, preset)
  
  for (const fmt of preset.formats) {
    const filename = renderFilename(preset.namingTemplate, ctx) + ext(fmt)
    await exportOne(v.cv, fmt, filename, preset.locale || 'en')
  }
}

/**
 * Build render context from variant and preset
 */
function buildContext(v: any, preset: ExportPreset): RenderContext {
  const cv = v.cv
  const role = guessRole(cv)
  const company = v.meta.linkedJobId ? linkedCompany(v.meta.linkedJobId) : undefined
  const date = new Date().toISOString().slice(0, 10)
  
  return {
    FirstName: cv.personalInfo?.firstName ?? cv.name?.split(' ')?.[0],
    MiddleName: cv.personalInfo?.middleName,
    LastName: cv.personalInfo?.lastName ?? cv.name?.split(' ')?.slice(1)?.join(' '),
    Role: role,
    Company: company,
    Date: date,
    JobId: v.meta.linkedJobId,
    VariantName: v.meta.name,
    Locale: preset.locale,
  }
}

/**
 * Get file extension for format
 */
function ext(fmt: ExportFormat): string {
  return fmt === 'pdf' ? '.pdf' : fmt === 'docx' ? '.docx' : '.gdoc'
}

/**
 * Export single file
 */
async function exportOne(
  cv: CVData,
  fmt: ExportFormat,
  filename: string,
  locale: 'en' | 'tr'
) {
  // Placeholder: integrate with existing export services
  console.log(`Exporting ${filename} as ${fmt} in ${locale}`)
  
  // TODO: Integrate with actual export services when available
  // For now, simulate export
  if (fmt === 'pdf') {
    console.log('PDF export not yet implemented')
  } else if (fmt === 'docx') {
    console.log('DOCX export not yet implemented')
  } else {
    console.log('Google Doc export not yet implemented')
  }
}

/**
 * Guess role from CV summary
 */
function guessRole(cv: CVData): string | undefined {
  const s = (cv.summary ?? '').toLowerCase()
  const m = s.match(/(frontend|backend|full[\s-]?stack|product|data|marketing|designer|devops)/)
  return m?.[1]?.replace(/\s+/g, ' ')
}

/**
 * Get company name from linked job
 */
function linkedCompany(jobId?: string): string | undefined {
  if (!jobId) return
  
  try {
    const { useJobsStore } = require('@/stores/jobs.store')
    const j = useJobsStore.getState().items.find((x: any) => x.id === jobId)
    return j?.company
  } catch {
    return undefined
  }
}
