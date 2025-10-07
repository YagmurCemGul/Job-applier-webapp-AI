import { BaseEntity } from './index'

export interface SocialLinks {
  linkedin?: string
  github?: string
  portfolio?: string
  whatsapp?: string
  twitter?: string
  facebook?: string
  instagram?: string
}

export interface User extends BaseEntity {
  // Authentication
  email: string
  emailVerified?: boolean

  // Personal Information
  firstName: string
  middleName?: string
  lastName: string
  displayName?: string
  
  // Contact Information
  phoneNumber?: string
  phoneCountryCode?: string
  
  // Profile
  profilePhoto?: string
  bio?: string
  location?: string
  
  // Social Links
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  whatsappUrl?: string
  
  // Preferences
  language: 'en' | 'tr'
  theme: 'light' | 'dark' | 'system'
  
  // Metadata
  lastLoginAt?: string
  loginCount?: number
}

export interface UserProfileForm {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phoneNumber?: string
  phoneCountryCode?: string
  bio?: string
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  whatsappUrl?: string
}

export interface UserSettings {
  language: 'en' | 'tr'
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
}
