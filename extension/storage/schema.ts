import type { DomainKey } from '../messaging/protocol'

export interface Settings {
  appOrigins: string[]
  hmacKey: string
  legal: Partial<Record<DomainKey, boolean>>
  enabled: Partial<Record<DomainKey, boolean>>
  dryRunDefault: Partial<Record<DomainKey, boolean>>
  rateLimit: Partial<Record<DomainKey, number>>
  language: 'en' | 'tr'
  paused: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  appOrigins: [],
  hmacKey: '',
  legal: {
    greenhouse: false,
    lever: false,
    workday: false,
    indeed: false,
    linkedin: false,
    generic: false
  },
  enabled: {
    greenhouse: true,
    lever: true,
    workday: true,
    indeed: true,
    linkedin: true,
    generic: true
  },
  dryRunDefault: {
    greenhouse: true,
    lever: true,
    workday: true,
    indeed: true,
    linkedin: true,
    generic: true
  },
  rateLimit: {
    greenhouse: 10,
    lever: 10,
    workday: 10,
    indeed: 10,
    linkedin: 10,
    generic: 10
  },
  language: 'en',
  paused: false
}
