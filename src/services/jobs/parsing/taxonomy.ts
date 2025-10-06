/**
 * Job parsing taxonomy: stopwords, skill aliases, role keywords
 */

export const STOPWORDS_EN = [
  'and',
  'or',
  'the',
  'a',
  'an',
  'to',
  'for',
  'of',
  'in',
  'on',
  'with',
  'is',
  'are',
  'be',
  'have',
  'has',
]

export const STOPWORDS_TR = ['ve', 'ile', 'bir', 'için', 'de', 'da', 'ya', 'veya', 'olan', 'olarak']

export const SKILL_ALIASES_EN: Record<string, string[]> = {
  react: ['reactjs', 'react.js'],
  node: ['nodejs', 'node.js'],
  typescript: ['ts'],
  python: ['py'],
  javascript: ['js'],
  'project management': ['pm', 'scrum', 'kanban', 'agile'],
  kubernetes: ['k8s'],
  docker: ['containerization'],
}

export const SKILL_ALIASES_TR: Record<string, string[]> = {
  'proje yönetimi': ['scrum', 'kanban', 'çevik'],
  pazarlama: ['marketing', 'dijital pazarlama'],
}

export const ROLE_KEYWORDS_EN = [
  'product manager',
  'frontend developer',
  'backend developer',
  'data analyst',
  'marketing manager',
  'designer',
  'software engineer',
  'devops engineer',
]

export const ROLE_KEYWORDS_TR = [
  'ürün yöneticisi',
  'önyüz geliştirici',
  'arkayüz geliştirici',
  'veri analisti',
  'pazarlama yöneticisi',
  'tasarımcı',
  'yazılım mühendisi',
]
