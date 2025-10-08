import { CoverLetterRequest, CoverLetterResult } from '@/types/coverLetter.types'
import { aiGenerateText } from '@/services/features/aiGenerateText.service'
import { getAISettings } from '@/stores/ai.store'

class CoverLetterService {
  async generateCoverLetter(request: CoverLetterRequest): Promise<CoverLetterResult> {
    const settings = getAISettings()
    const hasCoverLetterModel = !!settings.perTask.coverLetter
    
    // Use AI orchestration if configured, otherwise fallback to mock
    if (!hasCoverLetterModel && import.meta.env.DEV) {
      return this.getMockCoverLetter(request)
    }

    const prompt = this.buildCoverLetterPrompt(request)

    try {
      const content = await aiGenerateText(
        'You are an expert career coach and professional cover letter writer.',
        prompt,
        2000
      )

      return this.parseResult(content || this.getMockCoverLetter(request).content)
    } catch (error) {
      console.error('Cover letter generation error:', error)
      // Fallback to mock on error
      return this.getMockCoverLetter(request)
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

${request.customPrompt ? `**Additional Instructions:**
${request.customPrompt}` : ''}

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

  private parseResult(content: string): CoverLetterResult {
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
        tone: 'professional',
        suggestions: [
          'Personalize [placeholders] with your actual information',
          'Review and adjust tone to match your style',
          'Add specific company details if known',
        ],
      },
    }
  }

  private getMockCoverLetter(request: CoverLetterRequest): CoverLetterResult {
    const mockContent = `[Your Name]
[Your Address]
[Your Email]
[Your Phone]

[Date]

[Hiring Manager Name]
[Company Name]
[Company Address]

Dear Hiring Manager,

I am writing to express my strong interest in the ${request.jobTitle || 'position'} at ${request.companyName || 'your company'}. With my background in software development and passion for innovative technology, I am excited about the opportunity to contribute to your team.

In my current role, I have successfully led multiple projects that align perfectly with your requirements. My experience with React, TypeScript, and modern web technologies has enabled me to deliver high-quality solutions that improve user experience and business outcomes. For instance, I recently developed a comprehensive CV optimization tool that increased ATS compatibility scores by 45% for over 500 users.

I am particularly drawn to this opportunity because of your company's commitment to innovation and excellence. Your focus on leveraging AI and modern technologies resonates deeply with my professional values and career aspirations. I believe my skills in problem-solving, collaborative development, and user-centric design would make me a valuable addition to your team.

What excites me most about this role is the chance to work on cutting-edge projects that make a real impact. My proven track record of delivering quality software, combined with my enthusiasm for continuous learning, positions me well to contribute meaningfully from day one.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success. Thank you for considering my application, and I look forward to the possibility of speaking with you soon.

Sincerely,
[Your Name]`

    return {
      content: mockContent,
      metadata: {
        wordCount: mockContent.split(/\s+/).length,
        characterCount: mockContent.length,
        tone: request.tone || 'professional',
        suggestions: [
          'Replace [placeholders] with your information',
          'Add specific achievements from your experience',
          'Research the company culture and customize accordingly',
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