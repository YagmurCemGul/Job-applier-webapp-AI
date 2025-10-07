export interface CVData {
  id: string
  personalInfo: PersonalInfo
  summary?: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects?: Project[]
  certifications?: Certification[]
  languages?: Language[]
  awards?: Award[]
  volunteer?: Volunteer[]
  references?: Reference[]
  createdAt: Date
  updatedAt: Date
}

export interface PersonalInfo {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  phoneCountryCode: string
  location: {
    city?: string
    state?: string
    country?: string
  }
  linkedin?: string
  portfolio?: string
  github?: string
  whatsapp?: string
  profileImage?: string
}

export interface Experience {
  id: string
  title: string
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship'
  company: string
  location?: string
  locationType?: 'On-site' | 'Remote' | 'Hybrid'
  startDate: Date
  endDate?: Date
  currentlyWorking: boolean
  description: string
  skills: string[]
  achievements?: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  fieldOfStudy: string
  startDate: Date
  endDate?: Date
  currentlyStudying: boolean
  grade?: string
  activities?: string
  description?: string
}

export interface Skill {
  id: string
  name: string
  category: 'Technical' | 'Soft' | 'Language' | 'Tool' | 'Framework' | 'Other'
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  yearsOfExperience?: number
}

export interface Project {
  id: string
  name: string
  description: string
  role?: string
  technologies: string[]
  url?: string
  github?: string
  startDate?: Date
  endDate?: Date
  currentlyWorking: boolean
  highlights?: string[]
}

export interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: Date
  expirationDate?: Date
  credentialId?: string
  credentialUrl?: string
}

export interface Language {
  id: string
  language: string
  proficiency: 'Elementary' | 'Limited Working' | 'Professional Working' | 'Full Professional' | 'Native'
}

export interface Award {
  id: string
  title: string
  issuer: string
  date: Date
  description?: string
}

export interface Volunteer {
  id: string
  organization: string
  role: string
  startDate: Date
  endDate?: Date
  currentlyVolunteering: boolean
  description?: string
}

export interface Reference {
  id: string
  name: string
  position: string
  company: string
  email: string
  phone?: string
  relationship: string
}

// Common country codes
export const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+90', country: 'Turkey' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
]

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
] as const

export const LOCATION_TYPES = ['On-site', 'Remote', 'Hybrid'] as const

export const SKILL_CATEGORIES = [
  'Technical',
  'Soft',
  'Language',
  'Tool',
  'Framework',
  'Other',
] as const

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

export const PROFICIENCY_LEVELS = [
  'Elementary',
  'Limited Working',
  'Professional Working',
  'Full Professional',
  'Native',
] as const
