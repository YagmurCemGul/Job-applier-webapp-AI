import { CVData } from './cvData.types'

export interface SavedCV {
  id: string
  name: string
  description?: string
  cvData: CVData
  templateId: string
  jobTitle?: string
  company?: string
  atsScore?: number
  lastModified: Date
  createdAt: Date
  tags: string[]
  isPrimary: boolean
  version: number
}

export interface CVVersion {
  id: string
  cvId: string
  version: number
  cvData: CVData
  templateId: string
  createdAt: Date
  changeDescription?: string
}

export interface CVStatistics {
  totalCVs: number
  avgAtsScore: number
  lastModified: Date
  mostUsedTemplate: string
  totalApplications: number
}
