export type ExportFormat = 'pdf' | 'docx' | 'gdoc'

export interface ExportPreset {
  id: string
  name: string
  namingTemplate: string
  formats: ExportFormat[]
  locale?: 'en' | 'tr'
  includeCoverLetter?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RenderContext {
  FirstName?: string
  MiddleName?: string
  LastName?: string
  Role?: string
  Company?: string
  Date: string
  JobId?: string
  VariantName?: string
  Locale?: string
}
