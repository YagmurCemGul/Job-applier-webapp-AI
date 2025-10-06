import { CoverLetterRequest, CoverLetterResult } from '@/types/coverLetter.types'

class CoverLetterService {
  private readonly API_URL = 'https://api.anthropic.com/v1/messages'
  private readonly MODEL = 'claude-sonnet-4-20250514'

  async generateCoverLetter(request: CoverLetterRequest): Promise<CoverLetterResult> {
    // Development mode mock response (if no API key)
    if (import.meta.env.DEV && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
      console.warn('No Anthropic API key found. Using mock cover letter.')
      return this.getMockCoverLetter(request)
    }

    const prompt = this.buildCoverLetterPrompt(request)

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
          max_tokens: 2000,
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

      return this.parseResult(content, request)
    } catch (error) {
      console.error('Cover letter generation error:', error)
      throw new Error('Failed to generate cover letter. Please try again.')
    }
  }

  private buildCoverLetterPrompt(request: CoverLetterRequest): string {
    const lengthGuidance = {
      short: '200-250 words',
      medium: '300-400 words',
      long: '400-500 words',
    }

    return `You are an expert career coach and professional cover letter writer. Create a compelling, personalized cover letter based on the provided information.

**Candidate's CV Summary:**
${request.cvText.substring(0, 2000)}

**Job Posting:**
${request.jobPosting.substring(0, 2000)}

${request.jobTitle ? `**Position:** ${request.jobTitle}` : ''}
${request.companyName ? `**Company:** ${request.companyName}` : ''}

**Tone:** ${request.tone || 'professional'}
**Length:** ${lengthGuidance[request.length || 'medium']}

${
  request.customPrompt
    ? `**Additional Instructions:**
${request.customPrompt}`
    : ''
}

**Requirements:**

1. **Structure:**
   - Opening paragraph: Hook the reader, mention the position, show enthusiasm
   - Body paragraphs (2-3): Highlight relevant experience, skills, and achievements that match job requirements
   - Closing paragraph: Call to action, express interest in interview, thank them

2. **Content Guidelines:**
   - Use specific examples from the CV that align with job requirements
   - Show knowledge of the company (if mentioned in job posting)
   - Demonstrate how the candidate's experience solves company's needs
   - Include quantifiable achievements when possible
   - Match keywords from job posting naturally
   - Show personality while maintaining professionalism

3. **Writing Style:**
   - Active voice and action verbs
   - Concise and impactful sentences
   - No clichés or generic statements
   - Tone should be ${request.tone || 'professional'}
   - Natural, conversational flow

4. **Format:**
   - Include placeholder for [Your Name], [Your Email], [Your Phone], [Date], [Hiring Manager Name], [Company Name], [Company Address]
   - Standard business letter format
   - Professional greeting and closing

**CRITICAL:**
- Write ONLY the cover letter content
- Do NOT include any explanations, notes, or commentary
- Do NOT use markdown formatting
- Start directly with the letter content
- The letter should be ready to use as-is

Begin the cover letter now:`
  }

  private parseResult(content: string, request: CoverLetterRequest): CoverLetterResult {
    // Clean up the content
    const cleanedContent = content
      .trim()
      .replace(/```/g, '')
      .replace(/^(Cover Letter|Dear|To Whom)/i, (match) => match)

    const wordCount = cleanedContent.split(/\s+/).length
    const characterCount = cleanedContent.length

    return {
      content: cleanedContent,
      metadata: {
        wordCount,
        characterCount,
        tone: request.tone || 'professional',
        suggestions: [
          'Personalize [placeholders] with your actual information',
          'Review and adjust tone to match your style',
          'Add specific company details if known',
          'Proofread for any errors before sending',
        ],
      },
    }
  }

  // Mock cover letter for development
  private getMockCoverLetter(request: CoverLetterRequest): CoverLetterResult {
    const mockContent = `[Your Name]
[Your Address]
[Your Email]
[Your Phone]

[Date]

[Hiring Manager Name]
${request.companyName || '[Company Name]'}
[Company Address]

Dear Hiring Manager,

I am writing to express my strong interest in the ${request.jobTitle || 'position'} at ${request.companyName || 'your company'}. With my background in software development and passion for innovative technology, I am excited about the opportunity to contribute to your team.

In my current role, I have successfully led multiple projects that align perfectly with your requirements. My experience with React, TypeScript, and modern web technologies has enabled me to deliver high-quality solutions that improve user experience and business outcomes. For example, I architected a microservices-based platform that increased system performance by 40% and reduced deployment time by 60%.

What particularly excites me about this opportunity is ${request.companyName || 'your company'}'s commitment to innovation and excellence. I have been following your recent work in the industry, and I am impressed by your approach to solving complex problems. I believe my skills in problem-solving, collaborative development, and technical leadership would make me a valuable addition to your team.

Beyond technical expertise, I bring strong communication skills and a track record of mentoring junior developers. I thrive in collaborative environments and enjoy sharing knowledge to help teams grow and succeed together.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success. Thank you for considering my application, and I look forward to the possibility of speaking with you soon.

Sincerely,
[Your Name]

${request.customPrompt ? `\n--- Note: Custom instructions applied: "${request.customPrompt}" ---` : ''}

[MOCK DATA - Add your Anthropic API key to generate real AI cover letters]`

    return {
      content: mockContent,
      metadata: {
        wordCount: mockContent.split(/\s+/).length,
        characterCount: mockContent.length,
        tone: request.tone || 'professional',
        suggestions: [
          'Replace [placeholders] with your actual information',
          'Add specific achievements from your experience',
          'Research the company culture and values',
          'Customize the opening to grab attention',
          'Add your Anthropic API key for real AI generation',
        ],
      },
    }
  }

  // Copy to clipboard
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }
}

export const coverLetterService = new CoverLetterService()
