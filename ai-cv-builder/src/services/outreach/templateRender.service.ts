/**
 * Template rendering service with variable substitution and sanitization
 */
import DOMPurify from 'dompurify';

/**
 * Render email template with variable substitution
 * Returns subject, HTML (sanitized), and plain text
 */
export function renderTemplate(
  tpl: { subject: string; body: string },
  vars: Record<string, string>
): { subject: string; html: string; text: string } {
  const subject = substitute(tpl.subject, vars);
  const htmlRaw = substitute(tpl.body, vars).replace(/\n/g, '<br/>');
  const html = DOMPurify.sanitize(htmlRaw, { USE_PROFILES: { html: true } });
  const text = stripHtml(htmlRaw);

  return { subject, html, text };
}

/**
 * Substitute template variables ({{varName}} format)
 */
function substitute(s: string, vars: Record<string, string>): string {
  return s.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_, key) => vars[key] ?? '');
}

/**
 * Strip HTML tags to get plain text
 */
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}
