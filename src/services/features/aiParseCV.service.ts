import { aiRoute } from '@/services/ai/router.service'
import type { CVData } from '@/types/cvData.types'

/**
 * AI-powered CV parsing service
 */
export async function aiParseCV(text: string): Promise<Partial<CVData>> {
  const system =
    'Extract a structured resume JSON with fields: personalInfo (fullName, email, phone, location), summary, skills (array of {name, level}), experience (array of {position, company, startDate, endDate, description}), education (array of {degree, institution, graduationDate, description}), projects (array of {name, description}). Return strict JSON.'

  const { ok, text: out } = await aiRoute(
    {
      task: 'parse',
      system,
      prompt: text,
      maxTokens: 1500,
    },
    { allowCache: true }
  )

  try {
    return ok && out ? JSON.parse(out) : {}
  } catch {
    return {}
  }
}
