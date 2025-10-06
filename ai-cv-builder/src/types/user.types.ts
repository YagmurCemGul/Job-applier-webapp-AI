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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserProfile extends User {
  // Extended profile fields will be added later
}
