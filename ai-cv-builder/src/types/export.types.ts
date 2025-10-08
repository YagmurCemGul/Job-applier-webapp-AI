/**
 * Export format options
 */
export type ExportFormat = 'pdf' | 'docx' | 'gdoc'

/**
 * Export preset configuration
 */
export interface ExportPreset {
  id: string
  name: string // "Default EN", "TR-Backend", etc.
  namingTemplate: string // "CV_{FirstName}_{LastName}_{Role}_{Company}_{Date}"
  formats: ExportFormat[] // selected formats
  locale?: 'en' | 'tr'
  includeCoverLetter?: boolean // future-ready
  createdAt: Date
  updatedAt: Date
}

/**
 * Context for rendering naming templates
 * Tokens available for filename generation
 */
export interface RenderContext {
  FirstName?: string
  MiddleName?: string
  LastName?: string
  Role?: string
  Company?: string
  Date: string // yyyy-mm-dd
  JobId?: string
  VariantName?: string
  Locale?: string
}
