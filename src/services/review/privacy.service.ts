/**
 * @fileoverview Privacy and redaction utilities for feedback anonymization
 * Client-side best-effort PII redaction
 */

/**
 * Redact simple PII markers (names, emails) from feedback bodies for anonymous view
 * NOTE: This is best-effort client-side only - not cryptographically secure
 */
export function redactPII(text: string): string {
  return text
    // Redact likely full names (Capital Letter Capital Letter)
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[redacted-name]')
    // Redact email addresses
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    // Redact phone numbers (simple patterns)
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[redacted-phone]')
    // Redact URLs that might contain user info
    .replace(/https?:\/\/[^\s]+/g, '[redacted-url]');
}
