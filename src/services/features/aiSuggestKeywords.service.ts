import { aiRoute } from '@/services/ai/router.service'

/**
 * AI-powered keyword suggestion service
 */
export async function aiSuggestKeywords(
  jobText: string,
  currentKeywords: string[],
  limit = 15
): Promise<string[]> {
  const system =
    'Given a job posting text and an existing list of keywords, propose additional, closely-related, ATS-friendly keywords that would improve the match. Return a JSON array of short strings (single words or 2-word phrases), no explanations, no duplicates of existing keywords.'

  const prompt = `JOB POSTING:\n${jobText}\n\nCURRENT KEYWORDS:\n${currentKeywords.join(', ')}\n\nSuggest ${limit} additional relevant keywords.`

  const { ok, text } = await aiRoute(
    {
      task: 'suggest',
      system,
      prompt,
      maxTokens: 250,
    },
    { allowCache: true }
  )

  try {
    const arr = JSON.parse(text || '[]')
    return Array.isArray(arr) ? arr.slice(0, limit) : []
  } catch {
    return []
  }
}
