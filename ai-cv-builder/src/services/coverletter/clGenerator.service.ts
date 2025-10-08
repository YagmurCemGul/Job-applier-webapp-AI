/**
 * Cover Letter Generator Service - Step 30
 * Handles cover letter generation with AI provider fallback
 */

import type { CLTone, CLLength, CLLang } from '@/types/coverLetter.types'
import type { CVData } from '@/types/cvData.types'
import { getTemplateById } from './clTemplates.service'
import { buildVariables, escapeHtml } from './clVariables.service'

export interface GenerateOptions {
  tone: CLTone
  length: CLLength
  lang: CLLang
  templateId: string
  cv: CVData
  job?: {
    title?: string
    company?: string
    recruiterName?: string
    keywords?: string[]
  }
  extraPrompt?: string // appended to system prompt if provider is available
  prompts?: string[] // saved prompt bodies to append
}

/**
 * Generate cover letter (AI-aware with deterministic fallback)
 */
export async function generateCoverLetter(
  opts: GenerateOptions
): Promise<{ html: string }> {
  // Try AI provider if available
  try {
    const { aiService } = await import('@/services/ai.service')
    if (aiService && typeof aiService.generateCoverLetter === 'function') {
      return await aiGenerateCoverLetter(aiService, opts)
    }
  } catch (e) {
    console.warn('AI provider not available, using fallback generator')
  }

  // Deterministic fallback
  return { html: fallbackGenerate(opts) }
}

/**
 * Generate using AI service
 */
async function aiGenerateCoverLetter(
  aiService: any,
  opts: GenerateOptions
): Promise<{ html: string }> {
  const tpl = getTemplateById(opts.templateId)
  const vars = buildVariables({ cv: opts.cv, job: opts.job })
  const sys = buildSystemPrompt(opts)
  const user = renderTemplate(tpl.body, vars, opts.lang)
  const appended = [user, ...(opts.prompts ?? [])].join('\n\n')
  const full = `${appended}\n\n${opts.extraPrompt ?? ''}`

  try {
    const result = await aiService.generateCoverLetter({
      cvText: JSON.stringify(opts.cv),
      jobPosting: opts.job?.title
        ? `${opts.job.title} at ${opts.job.company}`
        : '',
      customPrompt: full,
      tone: opts.tone === 'formal' ? 'formal' : 'professional',
      length: opts.length,
    })
    return { html: wrap(result.content || user) }
  } catch (e) {
    console.warn('AI generation failed, using template')
    return { html: wrap(user) }
  }
}

/**
 * Deterministic fallback generator
 */
function fallbackGenerate(opts: GenerateOptions): string {
  const tpl = getTemplateById(opts.templateId)
  const vars = buildVariables({ cv: opts.cv, job: opts.job })

  // Inject missing keywords gently into Skills line if present
  const extraKw = (opts.job?.keywords ?? []).slice(0, 6).join(', ')
  if (extraKw) {
    vars.Skills = vars.Skills
      ? `${vars.Skills} Focus areas: ${extraKw}.`
      : `Focus areas: ${extraKw}.`
  }

  const body = renderTemplate(tpl.body, vars, opts.lang)
  const toned = applyTone(body, opts.tone, opts.lang)
  const sized = applyLength(toned, opts.length)
  return wrap(sized)
}

/**
 * Render template with variable substitution
 */
function renderTemplate(
  body: string,
  vars: Record<string, string>,
  lang: CLLang
): string {
  let out = body
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, escapeHtml(v ?? ''))
  }

  // Localize greetings/closings
  if (lang === 'tr') {
    out = out
      .replace(/Dear Hiring Manager,/gi, 'Sayın İK Ekibi,')
      .replace(/Dear (.*?),/gi, 'Sayın $1,')
      .replace(/Hello (.*?),/gi, 'Merhaba $1,')
      .replace(/Hi (.*?),/gi, 'Merhaba $1,')
      .replace(/Best regards,/gi, 'Saygılarımla,')
      .replace(/Sincerely,/gi, 'Saygılarımla,')
      .replace(/Yours sincerely,/gi, 'Saygılarımla,')
      .replace(/Warm regards,/gi, 'Sevgilerimle,')
      .replace(/Respectfully,/gi, 'Saygılarımla,')
      .replace(/Professional regards,/gi, 'Profesyonel saygılarımla,')
  }

  return out
}

/**
 * Apply tone adjustments
 */
function applyTone(text: string, tone: CLTone, lang: CLLang): string {
  if (tone === 'friendly') {
    return text
      .replace(/\bI am writing to\b/gi, "I'm excited to")
      .replace(/\bMerhaba\b/gi, 'Merhaba, büyük bir heyecanla')
  }
  if (tone === 'enthusiastic') {
    return text.replace(/\.\s/g, '! ').replace(/\bI am\b/gi, "I'm")
  }
  return text
}

/**
 * Apply length adjustments
 */
function applyLength(text: string, l: CLLength): string {
  if (l === 'short') {
    return text
      .split('\n')
      .filter(Boolean)
      .slice(0, 6)
      .join('\n')
  }
  if (l === 'long') {
    return (
      text +
      `\n\nP.S. I would welcome the chance to discuss how my background aligns with your needs.`
    )
  }
  return text
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(opts: GenerateOptions): string {
  return `You are a professional career writing assistant. Write a ${opts.lang.toUpperCase()} cover letter in a ${
    opts.tone
  } tone with ${
    opts.length
  } length, tailored to the given role/company, integrating relevant skills and achievements. Use concise, ATS-friendly language and avoid clichés.`
}

/**
 * Wrap plain text in HTML paragraphs
 */
function wrap(text: string): string {
  const paras = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('')
  return paras
}

/**
 * Token budget for AI generation
 */
function lengthBudget(l: CLLength, lang: CLLang): number {
  const base = l === 'short' ? 250 : l === 'long' ? 900 : 500
  return lang === 'tr' ? Math.round(base * 1.1) : base
}
