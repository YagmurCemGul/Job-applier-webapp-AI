import { v4 as uuidv4 } from 'uuid'
import {
  CV,
  Experience,
  Education,
  Skill,
  Certification,
  Project,
  Language,
  CVMetadata,
} from '@/types/cv.types'

// Generate unique ID
export function generateId(): string {
  return uuidv4()
}

// Calculate duration between two dates
export function calculateDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${
      remainingMonths !== 1 ? 's' : ''
    }`
  }
}

// Format date range
export function formatDateRange(
  startDate: string,
  endDate?: string,
  currentlyWorking?: boolean
): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  if (currentlyWorking) {
    return `${start} - Present`
  }

  if (!endDate) {
    return start
  }

  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return `${start} - ${end}`
}

// Create empty CV
export function createEmptyCV(userId: string): CV {
  const now = new Date().toISOString()

  return {
    id: generateId(),
    userId,
    firstName: '',
    lastName: '',
    contactInfo: {
      email: '',
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    references: [],
    metadata: getDefaultMetadata(),
    isPublic: false,
    isPrimary: false,
    createdAt: now,
    updatedAt: now,
  }
}

// Get default metadata
export function getDefaultMetadata(): CVMetadata {
  return {
    template: 'modern',
    language: 'en',
    showProfilePhoto: true,
    showSkillLevels: true,
    showDates: true,
  }
}

// Create empty experience
export function createEmptyExperience(): Experience {
  return {
    id: generateId(),
    title: '',
    company: '',
    employmentType: 'fullTime',
    location: '',
    locationType: 'onSite',
    startDate: '',
    currentlyWorking: false,
    description: '',
    skills: [],
  }
}

// Create empty education
export function createEmptyEducation(): Education {
  return {
    id: generateId(),
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    skills: [],
  }
}

// Create empty skill
export function createEmptySkill(): Skill {
  return {
    id: generateId(),
    name: '',
  }
}

// Create empty certification
export function createEmptyCertification(): Certification {
  return {
    id: generateId(),
    name: '',
    issuingOrganization: '',
    issueDate: '',
    skills: [],
  }
}

// Create empty project
export function createEmptyProject(): Project {
  return {
    id: generateId(),
    name: '',
    description: '',
    skills: [],
  }
}

// Create empty language
export function createEmptyLanguage(): Language {
  return {
    id: generateId(),
    name: '',
    proficiency: 'B1',
  }
}

// Extract skills from comma-separated string
export function extractSkillsFromString(input: string): string[] {
  return input
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)
}

// Convert skills array to comma-separated string
export function skillsToString(skills: string[]): string {
  return skills.join(', ')
}

// Calculate total years of experience
export function calculateTotalExperience(experiences: Experience[]): number {
  let totalMonths = 0

  experiences.forEach((exp) => {
    const start = new Date(exp.startDate)
    const end = exp.currentlyWorking || !exp.endDate ? new Date() : new Date(exp.endDate)
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
    totalMonths += months
  })

  return Math.round((totalMonths / 12) * 10) / 10 // Round to 1 decimal
}

// Get all unique skills from CV
export function getAllSkillsFromCV(cv: CV): string[] {
  const skills = new Set<string>()

  // From skills section
  cv.skills.forEach((skill) => skills.add(skill.name))

  // From experience
  cv.experience.forEach((exp) => exp.skills.forEach((skill) => skills.add(skill)))

  // From education
  cv.education.forEach((edu) => edu.skills.forEach((skill) => skills.add(skill)))

  // From certifications
  cv.certifications.forEach((cert) => cert.skills.forEach((skill) => skills.add(skill)))

  // From projects
  cv.projects.forEach((proj) => proj.skills.forEach((skill) => skills.add(skill)))

  return Array.from(skills).sort()
}

// Sort experiences by date (most recent first)
export function sortExperiencesByDate(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
}

// Sort education by date (most recent first)
export function sortEducationByDate(education: Education[]): Education[] {
  return [...education].sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateB.getTime() - dateA.getTime()
  })
}

// Validate CV completeness
export function validateCVCompleteness(cv: CV): {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
} {
  const missingFields: string[] = []

  if (!cv.firstName) missingFields.push('First Name')
  if (!cv.lastName) missingFields.push('Last Name')
  if (!cv.contactInfo.email) missingFields.push('Email')
  if (!cv.summary) missingFields.push('Professional Summary')
  if (cv.experience.length === 0) missingFields.push('Work Experience')
  if (cv.education.length === 0) missingFields.push('Education')
  if (cv.skills.length === 0) missingFields.push('Skills')

  const totalFields = 7
  const filledFields = totalFields - missingFields.length
  const completionPercentage = Math.round((filledFields / totalFields) * 100)

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  }
}