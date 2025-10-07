import {
  EmploymentType,
  LocationType,
  SkillLevel,
  LanguageProficiency,
  CVTemplateStyle,
} from '@/types/cv.types'

// Employment Type Options
export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'fullTime', label: 'Full-time' },
  { value: 'partTime', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

// Location Type Options
export const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'onSite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

// Skill Level Options
export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: '0-1 years' },
  { value: 'intermediate', label: 'Intermediate', description: '1-3 years' },
  { value: 'advanced', label: 'Advanced', description: '3-5 years' },
  { value: 'expert', label: 'Expert', description: '5+ years' },
]

// Language Proficiency Options (CEFR)
export const LANGUAGE_PROFICIENCIES: {
  value: LanguageProficiency
  label: string
  description: string
}[] = [
  { value: 'A1', label: 'A1 - Beginner', description: 'Basic phrases and expressions' },
  { value: 'A2', label: 'A2 - Elementary', description: 'Simple everyday situations' },
  { value: 'B1', label: 'B1 - Intermediate', description: 'Main points on familiar topics' },
  { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Complex texts and discussions' },
  { value: 'C1', label: 'C1 - Advanced', description: 'Effective and flexible use' },
  { value: 'C2', label: 'C2 - Proficient', description: 'Near-native fluency' },
  { value: 'native', label: 'Native', description: 'Native speaker' },
]

// CV Templates
export const CV_TEMPLATES: {
  value: CVTemplateStyle
  label: string
  description: string
  preview?: string
}[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Traditional chronological format',
  },
  {
    value: 'modern',
    label: 'Modern',
    description: 'Clean and contemporary design',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Simple and elegant',
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Bold and unique design',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Corporate and formal',
  },
  {
    value: 'executive',
    label: 'Executive',
    description: 'Senior-level positions',
  },
  {
    value: 'technical',
    label: 'Technical',
    description: 'For developers and engineers',
  },
  {
    value: 'academic',
    label: 'Academic',
    description: 'For researchers and academics',
  },
  {
    value: 'designer',
    label: 'Designer',
    description: 'Portfolio-focused',
  },
  {
    value: 'startup',
    label: 'Startup',
    description: 'Modern and dynamic',
  },
]

// Skill Categories
export const SKILL_CATEGORIES = [
  'Technical Skills',
  'Soft Skills',
  'Languages',
  'Tools & Technologies',
  'Frameworks & Libraries',
  'Databases',
  'Cloud & DevOps',
  'Design',
  'Management',
  'Other',
] as const

// Common Skills by Category
export const COMMON_SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'Technical Skills': [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
  ],
  'Frameworks & Libraries': [
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Express.js',
    'Next.js',
    'Django',
    'Flask',
    'Spring Boot',
    'Laravel',
  ],
  Databases: [
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'Elasticsearch',
    'Oracle',
    'SQL Server',
    'Cassandra',
    'DynamoDB',
  ],
  'Cloud & DevOps': [
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'Jenkins',
    'GitLab CI/CD',
    'Terraform',
    'Ansible',
  ],
  'Soft Skills': [
    'Leadership',
    'Communication',
    'Problem Solving',
    'Team Collaboration',
    'Time Management',
    'Critical Thinking',
    'Adaptability',
    'Creativity',
  ],
}

// CV Section Names
export const CV_SECTIONS = {
  BASIC_INFO: 'basicInfo',
  SUMMARY: 'summary',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
  LANGUAGES: 'languages',
  REFERENCES: 'references',
} as const

// Default CV Section Order
export const DEFAULT_SECTION_ORDER = [
  CV_SECTIONS.BASIC_INFO,
  CV_SECTIONS.SUMMARY,
  CV_SECTIONS.EXPERIENCE,
  CV_SECTIONS.EDUCATION,
  CV_SECTIONS.SKILLS,
  CV_SECTIONS.CERTIFICATIONS,
  CV_SECTIONS.PROJECTS,
  CV_SECTIONS.LANGUAGES,
  CV_SECTIONS.REFERENCES,
]

// Max file sizes
export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_CV_PAGES = 5

// ATS Score Thresholds
export const ATS_SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  POOR: 0,
} as const