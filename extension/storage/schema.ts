/**
 * Extension storage schema and types
 */

export type DomainKey = 'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin' | 'generic';

export type Settings = {
  appOrigins: string[];
  hmacKey: string;
  legal: Partial<Record<DomainKey, boolean>>;
  enabled: Partial<Record<DomainKey, boolean>>;
  dryRunDefault: Partial<Record<DomainKey, boolean>>;
  rateLimit: Partial<Record<DomainKey, number>>;
  language: 'en' | 'tr';
  paused: boolean;
};

export type RunRecord = {
  id: string;
  domain: DomainKey;
  url: string;
  timestamp: number;
  status: 'success' | 'error' | 'review' | 'rejected';
  message?: string;
  dryRun?: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  appOrigins: [],
  hmacKey: '',
  legal: {},
  enabled: {
    greenhouse: true,
    lever: true,
    workday: true,
    indeed: true,
    linkedin: true,
    generic: false,
  },
  dryRunDefault: {
    greenhouse: true,
    lever: true,
    workday: true,
    indeed: true,
    linkedin: true,
    generic: true,
  },
  rateLimit: {
    greenhouse: 10,
    lever: 10,
    workday: 10,
    indeed: 10,
    linkedin: 10,
    generic: 10,
  },
  language: 'en',
  paused: false,
};
