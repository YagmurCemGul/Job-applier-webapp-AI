import type { CLTone, CLLength, CLLang } from '@/types/coverletter.types'
import type { CVData } from '@/types/cvData.types'
import { getTemplateById } from './clTemplates.service'
import { buildVariables } from './clVariables.service'

export interface GenerateOptions {
  tone: CLTone
  length: CLLength
  lang: CLLang
  templateId: string
  cv: CVData
  job?: { title?: string; company?: string; recruiterName?: string; keywords?: string[] }
  extraPrompt?: string
  prompts?: string[]
}

export async function generateCoverLetter(opts: GenerateOptions): Promise<{ html: string }> {
  // Try AI provider if available
  try {
    const { aiGenerate } = await import('@/services/ai/provider.service')
    return await aiGenerateCoverLetter(aiGenerate, opts)
  } catch {
    // Deterministic fallback
    return { html: fallbackGenerate(opts) }
  }
}

async function aiGenerateCoverLetter(aiGenerate: any, opts: GenerateOptions) {
  const tpl = getTemplateById(opts.templateId)
  const vars = buildVariables({ cv: opts.cv, job: opts.job })
  const sys = buildSystemPrompt(opts)
  const user = renderTemplate(tpl.body, vars, opts.lang)
  const appended = [user, ...(opts.prompts ?? [])].join('\n\n')
  const full = `${appended}\n\n${opts.extraPrompt ?? ''}`
  const out = await aiGenerate({
    system: sys,
    user: full,
    maxTokens: lengthBudget(opts.length, opts.lang),
  })
  return { html: wrap(out) }
}

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

function renderTemplate(body: string, vars: Record<string, string>, lang: CLLang): string {
  let out = body
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, escapeHtml(v ?? ''))
  }

  if (lang === 'tr') {
    out = out
      .replace(/Dear Hiring Manager,/gi, 'Merhaba İK Ekibi,')
      .replace(/Best regards,/gi, 'Saygılarımla,')
      .replace(/Sincerely,/gi, 'Saygılarımla,')
      .replace(/Thank you for considering my application\./gi, 'Başvurumu değerlendirdiğiniz için teşekkür ederim.')
  }
  return out
}

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

function lengthBudget(l: CLLength, lang: CLLang): number {
  const base = l === 'short' ? 250 : l === 'long' ? 900 : 500
  return lang === 'tr' ? Math.round(base * 1.1) : base
}

function buildSystemPrompt(opts: GenerateOptions): string {
  return `You are a professional career writing assistant. Write a ${opts.lang.toUpperCase()} cover letter in a ${opts.tone} tone with ${opts.length} length, tailored to the given role/company, integrating relevant skills and achievements. Use concise, ATS-friendly language and avoid clichés.`
}

function wrap(text: string): string {
  const paras = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('')
  return paras
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
