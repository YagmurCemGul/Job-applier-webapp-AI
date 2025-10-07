# CV Data Model - Quick Reference Guide

## 📁 File Locations

```
src/
├── types/cv.types.ts              # All CV-related TypeScript types
├── lib/
│   ├── validations/
│   │   └── cv.validation.ts       # Zod validation schemas
│   ├── constants/
│   │   └── cv.constants.ts        # UI constants and options
│   ├── helpers/
│   │   └── cv.helpers.ts          # Helper functions
│   └── mock/
│       └── cv.mock.ts             # Sample CV data
```

## 🎯 Quick Imports

### Types
```typescript
import { 
  CV, 
  Experience, 
  Education, 
  Skill,
  EmploymentType,
  LocationType,
  SkillLevel 
} from '@/types/cv.types'
```

### Validations
```typescript
import { 
  experienceSchema, 
  educationSchema, 
  skillSchema,
  cvBasicInfoSchema 
} from '@/lib/validations/cv.validation'
```

### Constants
```typescript
import { 
  EMPLOYMENT_TYPES, 
  LOCATION_TYPES, 
  SKILL_LEVELS,
  CV_TEMPLATES 
} from '@/lib/constants/cv.constants'
```

### Helpers
```typescript
import { 
  generateId,
  calculateDuration,
  formatDateRange,
  createEmptyCV,
  getAllSkillsFromCV 
} from '@/lib/helpers/cv.helpers'
```

### Mock Data
```typescript
import { SAMPLE_CV } from '@/lib/mock/cv.mock'
```

## 🔧 Common Usage Examples

### Creating a New CV
```typescript
const newCV = createEmptyCV(userId)
```

### Adding Experience
```typescript
const experience = createEmptyExperience()
experience.title = 'Software Engineer'
experience.company = 'Tech Corp'
// ... fill other fields

// Validate
const validated = experienceSchema.parse(experience)
```

### Formatting Dates
```typescript
const duration = calculateDuration('2020-01-01', '2022-06-01')
// "2 years 5 months"

const range = formatDateRange('2020-01-01', '2022-06-01', false)
// "Jan 2020 - Jun 2022"
```

### Parsing Skills
```typescript
const skills = extractSkillsFromString('React, Node.js, TypeScript')
// ['React', 'Node.js', 'TypeScript']
```

### Calculating Total Experience
```typescript
const totalYears = calculateTotalExperience(cv.experience)
// 5.5
```

### Getting All Skills
```typescript
const allSkills = getAllSkillsFromCV(cv)
// Returns unique, sorted array of all skills from all sections
```

## 📋 Available Constants

### Employment Types
- fullTime, partTime, contract, freelance, internship

### Location Types
- onSite, hybrid, remote

### Skill Levels
- beginner, intermediate, advanced, expert

### Language Proficiency (CEFR)
- A1, A2, B1, B2, C1, C2, native

### CV Templates
- classic, modern, minimal, creative, professional, executive, technical, academic, designer, startup

### Skill Categories
- Technical Skills, Soft Skills, Languages, Tools & Technologies, Frameworks & Libraries, Databases, Cloud & DevOps, Design, Management, Other

## ✓ Validation Examples

### Experience
```typescript
const data = {
  title: 'Developer',
  company: 'Tech Co',
  employmentType: 'fullTime',
  location: 'Remote',
  locationType: 'remote',
  startDate: '2020-01-01',
  currentlyWorking: false,
  description: 'Building apps',
  skills: ['React']
}

const result = experienceSchema.safeParse(data)
if (result.success) {
  // Data is valid
} else {
  // Handle errors: result.error
}
```

### Skill
```typescript
const skill = {
  name: 'React',
  level: 'expert',
  category: 'Frameworks & Libraries',
  yearsOfExperience: 5
}

const result = skillSchema.safeParse(skill)
```

## 🎭 Sample Data

```typescript
import { SAMPLE_CV } from '@/lib/mock/cv.mock'

// Full CV example with:
// - Personal info (John Michael Doe)
// - 2 work experiences
// - 1 education
// - 8 skills
// - 1 certification
// - 2 projects
// - 2 languages
// - ATS score: 85
```

## 📊 Type Definitions

### Main CV Interface
```typescript
interface CV extends BaseEntity {
  userId: string
  firstName: string
  lastName: string
  contactInfo: CVContactInfo
  summary?: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
  projects: Project[]
  languages: Language[]
  references: Reference[]
  metadata: CVMetadata
  isPublic: boolean
  isPrimary: boolean
  atsScore?: number
  // ... more fields
}
```

### Experience Interface
```typescript
interface Experience {
  id: string
  title: string
  company: string
  employmentType: EmploymentType
  location: string
  locationType: LocationType
  startDate: string
  endDate?: string
  currentlyWorking: boolean
  description: string
  skills: string[]
  achievements?: string[]
}
```

---

**Last Updated:** 2025-10-07  
**Step:** ADIM 9 - CV Data Model Creation
