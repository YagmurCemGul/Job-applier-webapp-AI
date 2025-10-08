export interface SharedCV {
  id: string
  cvId: string
  userId: string
  shareLink: string
  password?: string
  expiresAt?: Date
  viewCount: number
  maxViews?: number
  createdAt: Date
  isActive: boolean
}

export interface ShareSettings {
  requirePassword: boolean
  password?: string
  expiresIn?: number // days
  maxViews?: number
  allowDownload: boolean
  showContactInfo: boolean
  trackViews: boolean
}

export const DEFAULT_SHARE_SETTINGS: ShareSettings = {
  requirePassword: false,
  allowDownload: true,
  showContactInfo: true,
  trackViews: true,
}
