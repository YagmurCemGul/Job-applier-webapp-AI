import { z } from 'zod'

// Helper: URL validation
const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .optional()

// Helper: LinkedIn URL validation
const linkedinUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true
      return val.startsWith('https://www.linkedin.com/in/') || val.includes('linkedin.com')
    },
    { message: 'Please enter a valid LinkedIn URL' }
  )
  .or(z.literal(''))
  .optional()

// Helper: GitHub URL validation
const githubUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true
      return val.startsWith('https://github.com/') || val.includes('github.com')
    },
    { message: 'Please enter a valid GitHub URL' }
  )
  .or(z.literal(''))
  .optional()

// Helper: Phone number validation (basic)
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .or(z.literal(''))
  .optional()

// User Profile Form Schema
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  
  middleName: z
    .string()
    .max(50, 'Middle name must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  phoneNumber: phoneSchema,
  
  phoneCountryCode: z.string().optional(),
  
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  linkedinUrl: linkedinUrlSchema,
  
  githubUrl: githubUrlSchema,
  
  portfolioUrl: urlSchema,
  
  whatsappUrl: z.string().optional().or(z.literal('')),
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

// Email validation (for checking if email is real)
export const emailValidationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>