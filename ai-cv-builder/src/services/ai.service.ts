interface OptimizationRequest {
  cvText: string
  jobPosting: string
  jobTitle?: string
  jobSkills?: string[]
}

interface OptimizationResult {
  optimizedCV: string
  changes: OptimizationChange[]
  atsScore: number
  missingSkills: string[]
  matchingSkills: string[]
  suggestions: string[]
  keywords: string[]
}

interface OptimizationChange {
  id: string
  type: 'added' | 'modified' | 'removed'
  section: string
  original: string
  optimized: string
  reason: string
  applied: boolean
}

class AIService {
  private readonly API_URL = 'https://api.anthropic.com/v1/messages'
  private readonly MODEL = 'claude-sonnet-4-20250514'

  async optimizeCV(request: OptimizationRequest): Promise<OptimizationResult> {
    // Development mode için mock response
    if (import.meta.env.DEV && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
      return this.getMockOptimization(request)
    }

    const prompt = this.buildOptimizationPrompt(request)

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.content[0].text

      return this.parseOptimizationResponse(content, request.cvText)
    } catch (error) {
      console.error('AI optimization error:', error)
      throw new Error('Failed to optimize CV. Please try again.')
    }
  }

  private buildOptimizationPrompt(request: OptimizationRequest): string {
    return `You are an expert ATS (Applicant Tracking System) optimization specialist and professional CV writer. Your task is to optimize a CV for a specific job posting to maximize ATS compatibility and improve the candidate's chances of getting an interview.

**Original CV:**
${request.cvText}

**Job Posting:**
${request.jobPosting}

${request.jobTitle ? `**Target Position:** ${request.jobTitle}` : ''}
${request.jobSkills?.length ? `**Key Skills Required:** ${request.jobSkills.join(', ')}` : ''}

**Your Tasks:**

1. **Analyze the CV and Job Posting:**
   - Identify missing keywords and skills from the job posting
   - Find areas where experience can be better aligned with job requirements
   - Detect ATS-unfriendly formatting or wording

2. **Optimize the CV:**
   - Add relevant keywords from the job posting naturally (no keyword stuffing)
   - Rephrase bullet points to better match job requirements
   - Quantify achievements where possible
   - Ensure all required skills are prominently featured
   - Use action verbs that align with the job description
   - Maintain truthfulness - only optimize existing content, don't fabricate

3. **Provide Detailed Feedback:**
   - List specific changes made and why
   - Identify skills mentioned in job posting but missing from CV
   - Calculate an ATS compatibility score (0-100)
   - Provide actionable improvement suggestions

**Response Format (JSON):**
\`\`\`json
{
  "optimizedCV": "Full optimized CV text here",
  "changes": [
    {
      "section": "Experience - Software Engineer at Company X",
      "original": "Original text",
      "optimized": "Optimized text",
      "reason": "Explanation of why this change improves ATS compatibility"
    }
  ],
  "atsScore": 85,
  "missingSkills": ["Skill not in CV but required"],
  "matchingSkills": ["Skill present in both CV and job posting"],
  "suggestions": [
    "Specific actionable suggestion for improvement"
  ],
  "keywords": ["Important ATS keywords added or emphasized"]
}
\`\`\`

CRITICAL RULES:
- Respond ONLY with valid JSON
- Do not add false information
- Only optimize existing content
- Maintain professional tone
- Ensure ATS compatibility
- DO NOT include any text outside the JSON object
- DO NOT use markdown code blocks in your response`
  }

  private parseOptimizationResponse(
    response: string,
    originalCV: string
  ): OptimizationResult {
    try {
      // Strip markdown code blocks if present
      let jsonText = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const parsed = JSON.parse(jsonText)

      // Add IDs to changes and set applied status
      const changes: OptimizationChange[] = parsed.changes.map(
        (change: any, index: number) => ({
          id: `change-${index}`,
          type: this.detectChangeType(change.original, change.optimized),
          section: change.section,
          original: change.original,
          optimized: change.optimized,
          reason: change.reason,
          applied: true, // All changes applied by default
        })
      )

      return {
        optimizedCV: parsed.optimizedCV || originalCV,
        changes,
        atsScore: Math.min(100, Math.max(0, parsed.atsScore || 0)),
        missingSkills: parsed.missingSkills || [],
        matchingSkills: parsed.matchingSkills || [],
        suggestions: parsed.suggestions || [],
        keywords: parsed.keywords || [],
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      throw new Error('Failed to parse optimization results')
    }
  }

  private detectChangeType(
    original: string,
    optimized: string
  ): 'added' | 'modified' | 'removed' {
    if (!original && optimized) return 'added'
    if (original && !optimized) return 'removed'
    return 'modified'
  }

  // Calculate ATS score based on keyword matching
  calculateATSScore(cvText: string, jobKeywords: string[]): number {
    const cvLower = cvText.toLowerCase()
    const matchedKeywords = jobKeywords.filter((keyword) =>
      cvLower.includes(keyword.toLowerCase())
    )

    const baseScore = (matchedKeywords.length / jobKeywords.length) * 100
    return Math.min(100, Math.round(baseScore))
  }

  private getMockOptimization(request: OptimizationRequest): OptimizationResult {
    return {
      optimizedCV: request.cvText + '\n\n[OPTIMIZED VERSION - This is a mock response for development]',
      changes: [
        {
          id: '1',
          type: 'modified',
          section: 'Professional Summary',
          original: 'Experienced developer',
          optimized: 'Senior Software Engineer with 5+ years of React expertise',
          reason: 'Added specific keywords from job posting to match ATS requirements',
          applied: true,
        },
        {
          id: '2',
          type: 'modified',
          section: 'Skills',
          original: 'Frontend Development',
          optimized: 'Frontend Development: React, TypeScript, Next.js, Tailwind CSS',
          reason: 'Expanded with specific technologies mentioned in job description',
          applied: true,
        },
        {
          id: '3',
          type: 'added',
          section: 'Experience - Senior Developer',
          original: '',
          optimized: 'Led team of 5 developers, improving deployment efficiency by 40%',
          reason: 'Added quantifiable achievement to demonstrate leadership skills',
          applied: true,
        },
        {
          id: '4',
          type: 'modified',
          section: 'Education',
          original: 'Computer Science degree',
          optimized: 'Bachelor of Science in Computer Science',
          reason: 'Used full formal title for better ATS recognition',
          applied: true,
        },
      ],
      atsScore: 85,
      missingSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      matchingSkills: ['React', 'TypeScript', 'Node.js', 'JavaScript', 'Git', 'Agile'],
      suggestions: [
        'Add quantifiable achievements with metrics (e.g., "Improved performance by 40%")',
        'Include Docker and Kubernetes experience if you have any',
        'Mention AWS or cloud platform experience',
        'Add CI/CD pipeline experience to match job requirements',
      ],
      keywords: ['React', 'TypeScript', 'Senior', 'Software Engineer', 'Leadership', 'Team Lead'],
    }
  }
}

export const aiService = new AIService()
export type { OptimizationResult, OptimizationChange, OptimizationRequest }