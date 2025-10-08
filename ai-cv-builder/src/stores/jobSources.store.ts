/**
 * Job Sources Store
 * Step 32 - Manages job source configurations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SourceConfig } from '@/types/jobs.types';

interface SourceState {
  sources: SourceConfig[];
  upsert: (s: SourceConfig) => void;
  toggle: (key: string, enabled: boolean) => void;
  getByKey: (key: string) => SourceConfig | undefined;
}

export const useJobSourcesStore = create<SourceState>()(
  persist(
    (set, get) => ({
      sources: [
        { 
          key: 'rss.generic', 
          enabled: true, 
          kind: 'rss', 
          domain: 'rss', 
          params: {}, 
          rateLimitPerMin: 30, 
          legalMode: true 
        },
        { 
          key: 'linkedin.api', 
          enabled: false, 
          kind: 'api', 
          domain: 'linkedin.com' 
        },
        { 
          key: 'indeed.api', 
          enabled: false, 
          kind: 'api', 
          domain: 'indeed.com' 
        },
        { 
          key: 'glassdoor.api', 
          enabled: false, 
          kind: 'api', 
          domain: 'glassdoor.com' 
        },
        { 
          key: 'linkedin.html', 
          enabled: false, 
          kind: 'html', 
          domain: 'linkedin.com', 
          legalMode: false 
        },
        { 
          key: 'indeed.html', 
          enabled: false, 
          kind: 'html', 
          domain: 'indeed.com', 
          legalMode: false 
        },
        { 
          key: 'glassdoor.html', 
          enabled: false, 
          kind: 'html', 
          domain: 'glassdoor.com', 
          legalMode: false 
        },
        { 
          key: 'kariyernet.html', 
          enabled: false, 
          kind: 'html', 
          domain: 'kariyer.net', 
          legalMode: false 
        }
      ],
      
      upsert: (s) => set({ 
        sources: [s, ...get().sources.filter(x => x.key !== s.key)] 
      }),
      
      toggle: (key, enabled) => set({ 
        sources: get().sources.map(s => s.key === key ? { ...s, enabled } : s) 
      }),
      
      getByKey: (key) => get().sources.find(s => s.key === key)
    }),
    { 
      name: 'job-sources', 
      storage: createJSONStorage(() => localStorage), 
      version: 1 
    }
  )
);
