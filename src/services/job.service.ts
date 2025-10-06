import { JobPosting } from '@/types/job.types'

class JobService {
  // Parse job posting text
  parseJobPosting(rawText: string): JobPosting['parsed'] {
    // Extract title (usually first line or contains "Position:", "Role:", etc.)
    const title = this.extractTitle(rawText)

    // Extract company name
    const company = this.extractCompany(rawText)

    // Extract location
    const location = this.extractLocation(rawText)

    // Extract employment type
    const employmentType = this.extractEmploymentType(rawText)

    // Extract experience level
    const experienceLevel = this.extractExperienceLevel(rawText)

    // Extract salary
    const salary = this.extractSalary(rawText)

    // Extract requirements
    const requirements = this.extractRequirements(rawText)

    // Extract responsibilities
    const responsibilities = this.extractResponsibilities(rawText)

    // Extract skills
    const skills = this.extractSkills(rawText)

    // Extract keywords for ATS
    const keywords = this.extractKeywords(rawText)

    return {
      title,
      company,
      location,
      employmentType,
      experienceLevel,
      salary,
      requirements,
      responsibilities,
      skills,
      keywords,
    }
  }

  private extractTitle(text: string): string | undefined {
    // Look for common patterns
    const patterns = [
      /(?:position|role|title|job)\s*:?\s*(.+)/i,
      /^(.+?)(?:\s+at\s+|\n|$)/m, // First line as fallback
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const title = match[1].trim()
        // Skip if it's too long or looks like a sentence
        if (title.length < 100 && !title.includes('.')) {
          return title
        }
      }
    }

    return undefined
  }

  private extractCompany(text: string): string | undefined {
    const patterns = [
      /(?:company|organization|employer)\s*:?\s*(.+)/i,
      /(?:at|@)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/,
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return undefined
  }

  private extractLocation(text: string): string | undefined {
    const patterns = [
      /(?:location|based in|city)\s*:?\s*(.+)/i,
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /(Remote|Hybrid|On-site)/i,
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return undefined
  }

  private extractEmploymentType(text: string): string | undefined {
    const types = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']

    for (const type of types) {
      if (text.toLowerCase().includes(type.toLowerCase())) {
        return type
      }
    }

    return undefined
  }

  private extractExperienceLevel(text: string): string | undefined {
    const levels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Principal', 'Executive']

    for (const level of levels) {
      if (text.toLowerCase().includes(level.toLowerCase())) {
        return level
      }
    }

    // Check for years of experience
    const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i)
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1])
      if (years >= 0 && years <= 2) return 'Entry Level'
      if (years >= 3 && years <= 5) return 'Mid Level'
      if (years >= 6) return 'Senior Level'
    }

    return undefined
  }

  private extractSalary(text: string): JobPosting['parsed']['salary'] {
    // Match patterns like "$100,000 - $150,000" or "$100k-$150k"
    const patterns = [
      /\$?([\d,]+)k?\s*-\s*\$?([\d,]+)k?/i,
      /(?:salary|compensation)\s*:?\s*\$?([\d,]+)k?\s*-\s*\$?([\d,]+)k?/i,
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let min = parseInt(match[1].replace(/,/g, ''))
        let max = parseInt(match[2].replace(/,/g, ''))

        // If 'k' notation, multiply by 1000
        if (text.toLowerCase().includes('k')) {
          if (min < 1000) min *= 1000
          if (max < 1000) max *= 1000
        }

        return {
          min,
          max,
          currency: 'USD',
        }
      }
    }

    return undefined
  }

  private extractRequirements(text: string): string[] {
    const requirements: string[] = []

    // Look for requirements section
    const reqSection = text.match(
      /(?:requirements|qualifications|required skills|must have)[\s\S]*?(?=\n\n|\nresponsibilities|\npreferred|$)/i
    )

    if (reqSection) {
      // Extract bullet points or numbered items
      const items = reqSection[0].match(/[-•*]\s*(.+)|^\d+\.\s*(.+)/gm)
      if (items) {
        requirements.push(
          ...items.map((item) =>
            item
              .replace(/^[-•*\d.]\s*/, '')
              .trim()
              .replace(/\s+/g, ' ')
          )
        )
      }
    }

    return requirements.slice(0, 10) // Limit to 10
  }

  private extractResponsibilities(text: string): string[] {
    const responsibilities: string[] = []

    // Look for responsibilities section
    const respSection = text.match(
      /(?:responsibilities|duties|you will)[\s\S]*?(?=\n\n|\nrequirements|\nqualifications|$)/i
    )

    if (respSection) {
      const items = respSection[0].match(/[-•*]\s*(.+)|^\d+\.\s*(.+)/gm)
      if (items) {
        responsibilities.push(
          ...items.map((item) =>
            item
              .replace(/^[-•*\d.]\s*/, '')
              .trim()
              .replace(/\s+/g, ' ')
          )
        )
      }
    }

    return responsibilities.slice(0, 10) // Limit to 10
  }

  private extractSkills(text: string): string[] {
    // Common technical skills
    const commonSkills = [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'Java',
      'C++',
      'C#',
      'SQL',
      'MongoDB',
      'PostgreSQL',
      'AWS',
      'Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'Git',
      'CI/CD',
      'Agile',
      'Scrum',
      'REST API',
      'GraphQL',
      'HTML',
      'CSS',
      'Tailwind',
      'Next.js',
      'Vue.js',
      'Angular',
      'Spring Boot',
      'Django',
      'Flask',
      'Ruby on Rails',
      'Redux',
      'Zustand',
      'Jest',
      'Cypress',
      'Testing',
      'TDD',
      'Microservices',
      'Redis',
      'Elasticsearch',
      'Kafka',
    ]

    const foundSkills = commonSkills.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase())
    )

    return [...new Set(foundSkills)]
  }

  private extractKeywords(text: string): string[] {
    // Extract important keywords for ATS
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3)

    // Remove common words
    const stopWords = new Set([
      'the',
      'and',
      'that',
      'this',
      'with',
      'from',
      'have',
      'will',
      'your',
      'they',
      'been',
      'were',
      'what',
      'when',
      'where',
      'which',
      'their',
      'would',
      'there',
      'could',
      'should',
      'about',
      'other',
      'into',
      'than',
      'then',
      'these',
      'some',
      'more',
      'also',
      'such',
      'work',
      'team',
    ])

    const keywords = words.filter((word) => !stopWords.has(word))

    // Count occurrences and return top keywords
    const wordCount = new Map<string, number>()
    keywords.forEach((word) => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word)
  }

  // Create job posting object
  createJobPosting(rawText: string): JobPosting {
    const now = new Date()
    return {
      id: crypto.randomUUID(),
      rawText,
      parsed: this.parseJobPosting(rawText),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  }
}

export const jobService = new JobService()
