/**
 * @fileoverview Types for Personal Brand & Portfolio Publisher.
 * @module types/site
 */

export type ThemeId =
  | 'minimal'
  | 'studio'
  | 'folio'
  | 'grid'
  | 'writer'
  | 'executive'
  | 'product'
  | 'engineer'
  | 'designer'
  | 'consultant';

export type Visibility = 'draft' | 'private' | 'public';

export type SocialNetwork =
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'mastodon'
  | 'threads';

export interface SiteProfile {
  id: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  emailPublic?: string;
  links: Array<{ label: string; url: string }>;
  skills: string[];
}

export interface SiteTheme {
  id: ThemeId;
  name: string;
  primary: string; // hex
  accent: string; // hex
  fontHead: string; // CSS font-family
  fontBody: string; // CSS font-family
  layout: 'single' | 'two-column' | 'grid';
  darkAuto: boolean;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentMd: string;
  coverUrl?: string;
  tags?: string[];
  dateISO: string;
  visibility: Visibility;
  highlights?: string[]; // short bullets
  quotes?: string[]; // from Step 39 feedback
  links?: string[]; // repos, demos
  competenceTags?: string[]; // execution/impact/etc.
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentMd: string;
  dateISO: string;
  coverUrl?: string;
  tags?: string[];
  visibility: Visibility;
}

export interface ContactForm {
  id: string;
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'textarea';
    required?: boolean;
  }>;
  captchaHoneypot: boolean;
  timeGateSec: number; // min seconds before submit
  sendToEmail: string; // delivered via Gmail (Step 35)
  successMessage?: string;
}

export interface SocialPost {
  id: string;
  network: SocialNetwork;
  title: string;
  body: string;
  url?: string; // link to post/article
  scheduledISO?: string;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
}

export interface PublishTarget {
  id: string;
  kind: 'zip' | 'vercel' | 'netlify' | 'github_pages';
  projectName?: string;
  domain?: string;
  lastUrl?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  uploadedAt: string;
}

export interface SiteState {
  profile: SiteProfile;
  theme: SiteTheme;
  cases: CaseStudy[];
  posts: BlogPost[];
  media: MediaItem[];
  contact?: ContactForm;
  targets: PublishTarget[];
  analyticsOptIn: boolean;
  noAITrainingMeta: boolean;
  updatedAt: string;
}

export interface DeployResult {
  url: string;
  deploymentId?: string;
  siteId?: string;
  repo?: string;
}

export interface ExportResult {
  url: string;
  size: number;
}

export interface AnalyticsEvent {
  path: string;
  ts: number;
  ref?: string;
  utm?: Record<string, string>;
}