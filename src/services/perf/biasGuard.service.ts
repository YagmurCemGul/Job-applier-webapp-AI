/**
 * Bias Guard Service
 * 
 * Removes biased language and redacts sensitive information from text.
 */

/**
 * Remove or rewrite biased phrases; redact emails/phones in text.
 */
export function sanitizeLanguage(text: string) {
  const redacted = text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?\d[\d\s\-().]{6,}\d/g, '[redacted-phone]');
  const replacements: Array<[RegExp, string]> = [
    [/\b(low|high)\s*energy\b/gi, 'consistent engagement'],
    [/\b(nice|aggressive)\b/gi, 'collaboration style'],
    [/\b(native|non[-\s]?native)\b/gi, 'communication clarity'],
  ];
  return replacements.reduce((acc, [re, to]) => acc.replace(re, to), redacted);
}
