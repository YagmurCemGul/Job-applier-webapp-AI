export interface CVTemplate {
  id: string
  name: string
  description: string
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'executive' | 'custom'
  previewImage?: string
  isDefault: boolean
  isPremium: boolean
  structure: TemplateStructure
  styling: TemplateStyle
  createdAt: Date
  updatedAt: Date
}

export interface TemplateStructure {
  sections: TemplateSection[]
  layout: 'single-column' | 'two-column' | 'sidebar'
  order: string[] // Section IDs in display order
}

export interface TemplateSection {
  id: string
  type: SectionType
  title: string
  enabled: boolean
  required: boolean
  order: number
}

export type SectionType =
  | 'personal-info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'awards'
  | 'volunteer'
  | 'publications'
  | 'references'

export interface TemplateStyle {
  fontFamily: string
  fontSize: {
    heading: number
    subheading: number
    body: number
  }
  colors: {
    primary: string
    secondary: string
    text: string
    accent: string
  }
  spacing: {
    section: number
    item: number
  }
  borders: boolean
  icons: boolean
}

export const DEFAULT_TEMPLATES: Omit<CVTemplate, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'template-modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with a focus on readability',
    category: 'modern',
    isDefault: true,
    isPremium: false,
    structure: {
      layout: 'two-column',
      sections: [
        {
          id: 'personal-info',
          type: 'personal-info',
          title: 'Contact',
          enabled: true,
          required: true,
          order: 1,
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          enabled: true,
          required: false,
          order: 2,
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          enabled: true,
          required: true,
          order: 3,
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          enabled: true,
          required: true,
          order: 4,
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          enabled: true,
          required: false,
          order: 5,
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Projects',
          enabled: true,
          required: false,
          order: 6,
        },
      ],
      order: ['personal-info', 'summary', 'skills', 'experience', 'education', 'projects'],
    },
    styling: {
      fontFamily: 'Inter, sans-serif',
      fontSize: { heading: 24, subheading: 16, body: 11 },
      colors: { primary: '#2563eb', secondary: '#64748b', text: '#1e293b', accent: '#3b82f6' },
      spacing: { section: 20, item: 12 },
      borders: false,
      icons: true,
    },
  },
  {
    id: 'template-classic',
    name: 'Classic ATS',
    description: 'Traditional format optimized for ATS systems',
    category: 'classic',
    isDefault: false,
    isPremium: false,
    structure: {
      layout: 'single-column',
      sections: [
        {
          id: 'personal-info',
          type: 'personal-info',
          title: 'Contact Information',
          enabled: true,
          required: true,
          order: 1,
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Objective',
          enabled: true,
          required: false,
          order: 2,
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Professional Experience',
          enabled: true,
          required: true,
          order: 3,
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          enabled: true,
          required: true,
          order: 4,
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Core Competencies',
          enabled: true,
          required: false,
          order: 5,
        },
      ],
      order: ['personal-info', 'summary', 'experience', 'education', 'skills'],
    },
    styling: {
      fontFamily: 'Georgia, serif',
      fontSize: { heading: 20, subheading: 14, body: 11 },
      colors: { primary: '#000000', secondary: '#374151', text: '#1f2937', accent: '#6b7280' },
      spacing: { section: 16, item: 10 },
      borders: true,
      icons: false,
    },
  },
  {
    id: 'template-minimal',
    name: 'Minimal',
    description: 'Simple, elegant design with maximum white space',
    category: 'minimal',
    isDefault: false,
    isPremium: false,
    structure: {
      layout: 'single-column',
      sections: [
        {
          id: 'personal-info',
          type: 'personal-info',
          title: '',
          enabled: true,
          required: true,
          order: 1,
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Experience',
          enabled: true,
          required: true,
          order: 2,
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          enabled: true,
          required: true,
          order: 3,
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          enabled: true,
          required: false,
          order: 4,
        },
      ],
      order: ['personal-info', 'experience', 'education', 'skills'],
    },
    styling: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: { heading: 18, subheading: 12, body: 10 },
      colors: { primary: '#18181b', secondary: '#52525b', text: '#27272a', accent: '#71717a' },
      spacing: { section: 24, item: 14 },
      borders: false,
      icons: false,
    },
  },
  {
    id: 'template-creative',
    name: 'Creative',
    description: 'Bold design for creative professionals',
    category: 'creative',
    isDefault: false,
    isPremium: true,
    structure: {
      layout: 'sidebar',
      sections: [
        {
          id: 'personal-info',
          type: 'personal-info',
          title: 'Profile',
          enabled: true,
          required: true,
          order: 1,
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'About Me',
          enabled: true,
          required: false,
          order: 2,
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Expertise',
          enabled: true,
          required: false,
          order: 3,
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Experience',
          enabled: true,
          required: true,
          order: 4,
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          enabled: true,
          required: true,
          order: 5,
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Portfolio',
          enabled: true,
          required: false,
          order: 6,
        },
      ],
      order: ['personal-info', 'summary', 'skills', 'experience', 'education', 'projects'],
    },
    styling: {
      fontFamily: 'Poppins, sans-serif',
      fontSize: { heading: 28, subheading: 18, body: 11 },
      colors: { primary: '#8b5cf6', secondary: '#a78bfa', text: '#1e293b', accent: '#c4b5fd' },
      spacing: { section: 20, item: 12 },
      borders: false,
      icons: true,
    },
  },
  {
    id: 'template-executive',
    name: 'Executive',
    description: 'Professional design for senior positions',
    category: 'executive',
    isDefault: false,
    isPremium: true,
    structure: {
      layout: 'two-column',
      sections: [
        {
          id: 'personal-info',
          type: 'personal-info',
          title: 'Contact',
          enabled: true,
          required: true,
          order: 1,
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Executive Summary',
          enabled: true,
          required: true,
          order: 2,
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Leadership Experience',
          enabled: true,
          required: true,
          order: 3,
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education & Certifications',
          enabled: true,
          required: true,
          order: 4,
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Core Competencies',
          enabled: true,
          required: false,
          order: 5,
        },
        {
          id: 'awards',
          type: 'awards',
          title: 'Awards & Recognition',
          enabled: true,
          required: false,
          order: 6,
        },
      ],
      order: ['personal-info', 'summary', 'experience', 'education', 'skills', 'awards'],
    },
    styling: {
      fontFamily: 'Merriweather, serif',
      fontSize: { heading: 22, subheading: 15, body: 11 },
      colors: { primary: '#0f172a', secondary: '#334155', text: '#1e293b', accent: '#475569' },
      spacing: { section: 18, item: 12 },
      borders: true,
      icons: false,
    },
  },
]

export const SECTION_DEFINITIONS: Record<
  SectionType,
  { label: string; description: string; icon: string }
> = {
  'personal-info': {
    label: 'Personal Information',
    description: 'Name, contact details, location',
    icon: 'User',
  },
  summary: {
    label: 'Professional Summary',
    description: 'Brief overview of your background',
    icon: 'FileText',
  },
  experience: {
    label: 'Work Experience',
    description: 'Employment history',
    icon: 'Briefcase',
  },
  education: { label: 'Education', description: 'Academic background', icon: 'GraduationCap' },
  skills: { label: 'Skills', description: 'Technical and soft skills', icon: 'Award' },
  projects: {
    label: 'Projects',
    description: 'Notable projects and achievements',
    icon: 'FolderKanban',
  },
  certifications: {
    label: 'Certifications',
    description: 'Professional certifications',
    icon: 'Medal',
  },
  languages: { label: 'Languages', description: 'Language proficiencies', icon: 'Languages' },
  awards: { label: 'Awards & Honors', description: 'Recognition and achievements', icon: 'Trophy' },
  volunteer: { label: 'Volunteer Work', description: 'Community involvement', icon: 'Heart' },
  publications: { label: 'Publications', description: 'Articles and papers', icon: 'BookOpen' },
  references: { label: 'References', description: 'Professional references', icon: 'Users' },
}
