import DOMPurify from 'isomorphic-dompurify'

/**
 * Render template with variable substitution
 */
export function renderTemplate(
  tpl: { subject: string; body: string },
  vars: Record<string, string>
): { subject: string; html: string; text: string } {
  const subject = substitute(tpl.subject, vars)
  const htmlRaw = substitute(tpl.body, vars).replace(/\n/g, '<br/>')
  const html = DOMPurify.sanitize(htmlRaw, { USE_PROFILES: { html: true } })
  const text = strip(htmlRaw)

  return { subject, html, text }
}

/**
 * Substitute variables in template string
 * Variables are in format: {{VariableName}}
 */
function substitute(s: string, vars: Record<string, string>): string {
  return s.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_, k) => vars[k] ?? '')
}

/**
 * Strip HTML tags to get plain text
 */
function strip(h: string): string {
  const d = document.createElement('div')
  d.innerHTML = h
  return d.textContent || ''
}
