import { BaseEntity } from './index'

// Employment Type
export type EmploymentType = 'fullTime' | 'partTime' | 'contract' | 'freelance' | 'internship'

// Location Type
export type LocationType = 'onSite' | 'hybrid' | 'remote'

// Skill Level
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// Language Proficiency (CEFR levels)
export type LanguageProficiency = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native'

// CV Template Style
export type CVTemplateStyle =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'creative'
  | 'professional'
  | 'executive'
  | 'technical'
  | 'academic'
  | 'designer'
  | 'startup'

// Work Experience
export interface Experience {
  id: string
  title: string
  company: string
  employmentType: EmploymentType
  location: string
  locationType: LocationType
  startDate: string // ISO date string
  endDate?: string // ISO date string, undefined if current
  currentlyWorking: boolean
  description: string
  skills: string[]
  achievements?: string[]
}

// Education
export interface Education {
  id: string
  school: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate?: string // undefined if expected/ongoing
  grade?: string
  activities?: string
  description?: string
  skills: string[]
}

// Skill
export interface Skill {
  id: string
  name: string
  level?: SkillLevel
  category?: string // e.g., "Technical", "Soft Skills", "Languages"
  yearsOfExperience?: number
}

// License or Certification
export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string
  credentialId?: string
  credentialUrl?: string
  skills: string[]
}

// Project
export interface Project {
  id: string
  name: string
  description: string
  url?: string
  startDate?: string
  endDate?: string
  currentlyWorking?: boolean
  associatedWith?: string // Company or organization
  skills: string[]
  images?: string[] // Project screenshots/images
}

// Language
export interface Language {
  id: string
  name: string
  proficiency: LanguageProficiency
}

// Reference
export interface Reference {
  id: string
  name: string
  title: string
  company: string
  email?: string
  phone?: string
  relationship: string
}

// Custom Section (for flexibility)
export interface CustomSection {
  id: string
  title: string
  items: {
    id: string
    title?: string
    subtitle?: string
    description?: string
    date?: string
    [key: string]: any
  }[]
}

// CV Contact Information
export interface CVContactInfo {
  email: string
  phone?: string
  phoneCountryCode?: string
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
  whatsappUrl?: string
}

// CV Metadata
export interface CVMetadata {
  template: CVTemplateStyle
  colorScheme?: string
  fontFamily?: string
  fontSize?: number
  pageMargins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  sectionOrder?: string[]
  showProfilePhoto?: boolean
  showSkillLevels?: boolean
  showDates?: boolean
  language: 'en' | 'tr'
}

// Main CV Interface
export interface CV extends BaseEntity {
  userId: string
  
  // Basic Information
  firstName: string
  middleName?: string
  lastName: string
  profilePhoto?: string
  
  // Contact
  contactInfo: CVContactInfo
  
  // Professional Summary
  summary?: string
  
  // CV Sections
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  projects: Project[]
  languages: Language[]
  references: Reference[]
  customSections?: CustomSection[]
  
  // Metadata
  metadata: CVMetadata
  
  // Additional Info
  title?: string // CV title (e.g., "Senior Software Engineer CV")
  targetJobTitle?: string
  targetIndustry?: string
  
  // Status
  isPublic: boolean
  isPrimary: boolean
  
  // ATS Optimization
  atsScore?: number
  atsKeywords?: string[]
  lastOptimizedAt?: string
  
  // File URLs (if exported)
  pdfUrl?: string
  docxUrl?: string
}

// CV Form Data (for forms)
export interface CVFormData {
  // Basic
  firstName: string
  middleName?: string
  lastName: string
  profilePhoto?: string
  
  // Contact
  email: string
  phone?: string
  phoneCountryCode?: string
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
  
  // Summary
  summary?: string
  
  // Target
  title?: string
  targetJobTitle?: string
  targetIndustry?: string
}

// Experience Form Data
export interface ExperienceFormData {
  title: string
  company: string
  employmentType: EmploymentType
  location: string
  locationType: LocationType
  startDate: string
  endDate?: string
  currentlyWorking: boolean
  description: string
  skills: string[]
  achievements?: string[]
}

// Education Form Data
export interface EducationFormData {
  school: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate?: string
  grade?: string
  activities?: string
  description?: string
  skills: string[]
}

// Certification Form Data
export interface CertificationFormData {
  name: string
  issuingOrganization: string
  issueDate: string
  expirationDate?: string
  credentialId?: string
  credentialUrl?: string
  skills: string[]
}

// Project Form Data
export interface ProjectFormData {
  name: string
  description: string
  url?: string
  startDate?: string
  endDate?: string
  currentlyWorking?: boolean
  associatedWith?: string
  skills: string[]
}

// Skill Form Data
export interface SkillFormData {
  name: string
  level?: SkillLevel
  category?: string
  yearsOfExperience?: number
}

// Language Form Data
export interface LanguageFormData {
  name: string
  proficiency: LanguageProficiency
}

// CV List Item (for displaying in lists)
export interface CVListItem {
  id: string
  title: string
  firstName: string
  lastName: string
  targetJobTitle?: string
  isPrimary: boolean
  atsScore?: number
  updatedAt: string
  createdAt: string
}

// CV Export Options
export interface CVExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'json'
  template: CVTemplateStyle
  includePhoto: boolean
  colorScheme?: string
  fileName?: string
}

// ATS Optimization Result
export interface ATSOptimizationResult {
  score: number
  keywords: {
    found: string[]
    missing: string[]
    suggestions: string[]
  }
  sections: {
    name: string
    status: 'good' | 'warning' | 'error'
    message: string
  }[]
  improvements: {
    priority: 'high' | 'medium' | 'low'
    category: string
    message: string
    action: string
  }[]
  formatting: {
    hasProperHeadings: boolean
    hasContactInfo: boolean
    hasMeasurableAchievements: boolean
    hasSkillsSection: boolean
    fileSize?: number
    pageCount?: number
  }
}