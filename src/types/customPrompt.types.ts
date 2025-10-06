export interface CustomPrompt {
  id: string
  name: string
  content: string
  folderId?: string
  tags: string[]
  isDefault: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface PromptFolder {
  id: string
  name: string
  color?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: 'technical' | 'creative' | 'formal' | 'general'
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'template-1',
    name: 'Emphasize Leadership',
    description: 'Highlight your leadership and team management experience',
    content:
      'Focus on my leadership experience and ability to manage cross-functional teams. Emphasize examples where I mentored junior developers and led successful projects.',
    category: 'general',
  },
  {
    id: 'template-2',
    name: 'Technical Focus',
    description: 'Highlight technical skills and expertise',
    content:
      'Emphasize my technical expertise and deep knowledge of modern web technologies. Include specific examples of complex technical problems I have solved.',
    category: 'technical',
  },
  {
    id: 'template-3',
    name: 'Career Change',
    description: 'For transitioning to a new field',
    content:
      'Address my career transition and explain how my transferable skills apply to this new role. Show enthusiasm for learning and adapting to new challenges.',
    category: 'general',
  },
  {
    id: 'template-4',
    name: 'Startup Culture',
    description: 'For startup/fast-paced environment positions',
    content:
      'Highlight my ability to work in fast-paced, dynamic environments. Emphasize my startup experience, adaptability, and comfort with wearing multiple hats.',
    category: 'general',
  },
  {
    id: 'template-5',
    name: 'Remote Work',
    description: 'Emphasize remote work capabilities',
    content:
      'Emphasize my experience with remote work, self-motivation, and ability to communicate effectively across time zones. Mention my home office setup and productivity habits.',
    category: 'general',
  },
]

export const FOLDER_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Green', class: 'bg-green-100 text-green-800' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-800' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-800' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100 text-pink-800' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-100 text-gray-800' },
] as const
