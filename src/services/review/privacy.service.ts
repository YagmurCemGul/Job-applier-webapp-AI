/**
 * Redact simple PII markers (names, emails) from feedback bodies
 * for anonymous view
 *
 * Note: This is best-effort client-side redaction
 */
export function redactPII(text: string): string {
  return text
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[redacted-name]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
}
