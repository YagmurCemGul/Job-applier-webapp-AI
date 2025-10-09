/**
 * @fileoverview Zustand store for portfolio site state.
 * @module stores/site
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SiteState,
  CaseStudy,
  BlogPost,
  PublishTarget,
  SiteTheme,
  SiteProfile,
  ContactForm,
  SocialPost,
  MediaItem,
} from '@/types/site.types';

interface State {
  site: SiteState;
  social: SocialPost[];
  upsertProfile: (p: Partial<SiteProfile>) => void;
  setTheme: (t: Partial<SiteTheme>) => void;
  upsertCase: (c: CaseStudy) => void;
  upsertPost: (p: BlogPost) => void;
  removeCase: (id: string) => void;
  removePost: (id: string) => void;
  setContact: (f: ContactForm) => void;
  setTargets: (t: PublishTarget[]) => void;
  setAnalyticsOptIn: (v: boolean) => void;
  setNoAITraining: (v: boolean) => void;
  upsertSocial: (s: SocialPost) => void;
  markSocial: (id: string, status: SocialPost['status']) => void;
  removeSocial: (id: string) => void;
  addMedia: (m: MediaItem) => void;
  removeMedia: (id: string) => void;
  get: () => SiteState;
  getSocial: () => SocialPost[];
}

const defaultState: SiteState = {
  profile: {
    id: 'me',
    headline: '',
    bio: '',
    links: [],
    skills: [],
  },
  theme: {
    id: 'minimal',
    name: 'Minimal',
    primary: '#111827',
    accent: '#4f46e5',
    fontHead: 'Inter',
    fontBody: 'Inter',
    layout: 'single',
    darkAuto: true,
  },
  cases: [],
  posts: [],
  media: [],
  contact: undefined,
  targets: [],
  analyticsOptIn: false,
  noAITrainingMeta: false,
  updatedAt: new Date().toISOString(),
};

export const useSite = create<State>()(
  persist(
    (set, get) => ({
      site: defaultState,
      social: [],
      upsertProfile: (p) =>
        set((s) => ({
          site: {
            ...s.site,
            profile: { ...s.site.profile, ...p },
            updatedAt: new Date().toISOString(),
          },
        })),
      setTheme: (t) =>
        set((s) => ({
          site: {
            ...s.site,
            theme: { ...s.site.theme, ...t },
            updatedAt: new Date().toISOString(),
          },
        })),
      upsertCase: (c) =>
        set((s) => ({
          site: {
            ...s.site,
            cases: [c, ...s.site.cases.filter((x) => x.id !== c.id)],
            updatedAt: new Date().toISOString(),
          },
        })),
      upsertPost: (p) =>
        set((s) => ({
          site: {
            ...s.site,
            posts: [p, ...s.site.posts.filter((x) => x.id !== p.id)],
            updatedAt: new Date().toISOString(),
          },
        })),
      removeCase: (id) =>
        set((s) => ({
          site: {
            ...s.site,
            cases: s.site.cases.filter((x) => x.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),
      removePost: (id) =>
        set((s) => ({
          site: {
            ...s.site,
            posts: s.site.posts.filter((x) => x.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),
      setContact: (f) =>
        set((s) => ({
          site: {
            ...s.site,
            contact: f,
            updatedAt: new Date().toISOString(),
          },
        })),
      setTargets: (t) =>
        set((s) => ({
          site: {
            ...s.site,
            targets: t,
            updatedAt: new Date().toISOString(),
          },
        })),
      setAnalyticsOptIn: (v) =>
        set((s) => ({
          site: {
            ...s.site,
            analyticsOptIn: v,
            updatedAt: new Date().toISOString(),
          },
        })),
      setNoAITraining: (v) =>
        set((s) => ({
          site: {
            ...s.site,
            noAITrainingMeta: v,
            updatedAt: new Date().toISOString(),
          },
        })),
      upsertSocial: (sPost) =>
        set((s) => ({
          social: [sPost, ...s.social.filter((x) => x.id !== sPost.id)],
        })),
      markSocial: (id, status) =>
        set((s) => ({
          social: s.social.map((x) => (x.id === id ? { ...x, status } : x)),
        })),
      removeSocial: (id) =>
        set((s) => ({
          social: s.social.filter((x) => x.id !== id),
        })),
      addMedia: (m) =>
        set((s) => ({
          site: {
            ...s.site,
            media: [m, ...s.site.media],
            updatedAt: new Date().toISOString(),
          },
        })),
      removeMedia: (id) =>
        set((s) => ({
          site: {
            ...s.site,
            media: s.site.media.filter((x) => x.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),
      get: () => get().site,
      getSocial: () => get().social,
    }),
    { name: 'site', storage: createJSONStorage(() => localStorage), version: 1 }
  )
);