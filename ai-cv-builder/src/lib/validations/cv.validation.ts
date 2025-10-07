import { z } from 'zod'

// Helper: Date string validation
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
  .or(z.literal(''))

// Helper: URL validation
const urlSchema = z.string().url('Invalid URL').or(z.literal('')).optional()

// Employment Type Schema
export const employmentTypeSchema = z.enum([
  'fullTime',
  'partTime',
  'contract',
  'freelance',
  'internship',
])

// Location Type Schema
export const locationTypeSchema = z.enum(['onSite', 'hybrid', 'remote'])

// Skill Level Schema
export const skillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert'])

// Language Proficiency Schema
export const languageProficiencySchema = z.enum([
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'native',
])

// CV Basic Info Schema
export const cvBasicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  middleName: z.string().max(50).optional().or(z.literal('')),
  lastName: z.string().min(1, 'Last name is required').max(50),
  profilePhoto: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  phoneCountryCode: z.string().optional(),
  location: z.string().max(100).optional().or(z.literal('')),
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  portfolioUrl: urlSchema,
  websiteUrl: urlSchema,
  summary: z.string().max(1000).optional().or(z.literal('')),
  title: z.string().max(100).optional().or(z.literal('')),
  targetJobTitle: z.string().max(100).optional().or(z.literal('')),
  targetIndustry: z.string().max(100).optional().or(z.literal('')),
})

// Experience Schema
export const experienceSchema = z
  .object({
    title: z.string().min(1, 'Job title is required').max(100),
    company: z.string().min(1, 'Company is required').max(100),
    employmentType: employmentTypeSchema,
    location: z.string().max(100),
    locationType: locationTypeSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema.optional(),
    currentlyWorking: z.boolean(),
    description: z.string().max(2000),
    skills: z.array(z.string()).default([]),
    achievements: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (!data.currentlyWorking && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

// Education Schema
export const educationSchema = z.object({
  school: z.string().min(1, 'School is required').max(100),
  degree: z.string().min(1, 'Degree is required').max(100),
  fieldOfStudy: z.string().min(1, 'Field of study is required').max(100),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
  grade: z.string().max(20).optional().or(z.literal('')),
  activities: z.string().max(500).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
})

// Skill Schema
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50),
  level: skillLevelSchema.optional(),
  category: z.string().max(50).optional().or(z.literal('')),
  yearsOfExperience: z.number().min(0).max(50).optional(),
})

// Certification Schema
export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(100),
  issuingOrganization: z.string().min(1, 'Issuing organization is required').max(100),
  issueDate: dateStringSchema,
  expirationDate: dateStringSchema.optional(),
  credentialId: z.string().max(100).optional().or(z.literal('')),
  credentialUrl: urlSchema,
  skills: z.array(z.string()).default([]),
})

// Project Schema
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  url: urlSchema,
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  currentlyWorking: z.boolean().optional(),
  associatedWith: z.string().max(100).optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
})

// Language Schema
export const languageSchema = z.object({
  name: z.string().min(1, 'Language name is required').max(50),
  proficiency: languageProficiencySchema,
})

// Reference Schema
export const referenceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().min(1, 'Title is required').max(100),
  company: z.string().min(1, 'Company is required').max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  relationship: z.string().min(1, 'Relationship is required').max(100),
})

// Export types
export type CVBasicInfoFormData = z.infer<typeof cvBasicInfoSchema>
export type ExperienceFormData = z.infer<typeof experienceSchema>
export type EducationFormData = z.infer<typeof educationSchema>
export type SkillFormData = z.infer<typeof skillSchema>
export type CertificationFormData = z.infer<typeof certificationSchema>
export type ProjectFormData = z.infer<typeof projectSchema>
export type LanguageFormData = z.infer<typeof languageSchema>
export type ReferenceFormData = z.infer<typeof referenceSchema>