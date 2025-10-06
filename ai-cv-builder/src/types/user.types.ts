import { BaseEntity } from './index'

export interface User extends BaseEntity {
  email: string
  firstName: string
  middleName?: string
  lastName: string
  phoneNumber?: string
  phoneCountryCode?: string
  profilePhoto?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  whatsappUrl?: string
  language: 'en' | 'tr'
  theme: 'light' | 'dark' | 'system'
}

// Extended profile fields will be added later
export type UserProfile = User
