export interface UserSettings {
  userId: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'tr'
    emailNotifications: boolean
    autoSave: boolean
    defaultTemplate: string
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    showPhone: boolean
  }
  notifications: {
    newFeatures: boolean
    tips: boolean
    weeklyDigest: boolean
    marketing: boolean
  }
  updatedAt: Date
}

export const DEFAULT_SETTINGS: Omit<UserSettings, 'userId' | 'updatedAt'> = {
  preferences: {
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    autoSave: true,
    defaultTemplate: 'template-modern',
  },
  privacy: {
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
  },
  notifications: {
    newFeatures: true,
    tips: true,
    weeklyDigest: false,
    marketing: false,
  },
}
