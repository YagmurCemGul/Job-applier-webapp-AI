/**
 * Safe keyword highlighting service with XSS protection and word boundary support
 */

/**
 * Escape special regex characters
 */
export function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Highlight terms in text with <mark> tags
 * 
 * @param input - Plain text to highlight
 * @param terms - Keywords to highlight (case-insensitive)
 * @param attr - Optional function to generate attributes for each term
 * @returns HTML string with <mark> wrappers
 */
export function highlightText(
  input: string,
  terms: string[],
  attr?: (term: string) => Record<string, string>
): string {
  if (!input || !terms.length) return escapeHtml(input)

  // Escape HTML first
  let result = escapeHtml(input)

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length)

  // Track already highlighted positions to avoid nesting
  const highlighted = new Set<string>()

  for (const term of sortedTerms) {
    const escaped = escapeRegex(term)
    // Use unicode word boundary for better international support
    const regex = new RegExp(
      `(?<!<mark[^>]*>)\\b(${escaped})\\b(?![^<]*<\\/mark>)`,
      'gi'
    )

    result = result.replace(regex, (match, p1) => {
      const key = `${match.toLowerCase()}_${result.indexOf(match)}`
      if (highlighted.has(key)) return match

      highlighted.add(key)
      const attrs = attr?.(term) || {}
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeHtml(String(v))}"`)
        .join(' ')

      return `<mark data-kw="${escapeHtml(term)}" ${attrStr} aria-label="keyword: ${escapeHtml(term)}">${match}</mark>`
    })
  }

  return result
}

/**
 * Split and highlight job text with keywords
 * 
 * @param raw - Raw job text
 * @param terms - Keywords to highlight
 * @returns Object with highlighted HTML
 */
export function splitAndHighlightJob(
  raw: string,
  terms: string[]
): { html: string } {
  const html = highlightText(raw, terms, (term) => ({
    class: 'bg-blue-100 dark:bg-blue-900 border-b-2 border-blue-400 dark:border-blue-500',
  }))

  return { html }
}

/**
 * Highlight keywords in CV text sections
 * 
 * @param text - CV text content
 * @param terms - Keywords to highlight
 * @returns Highlighted HTML string
 */
export function highlightCVText(text: string, terms: string[]): string {
  return highlightText(text, terms, (term) => ({
    class: 'bg-green-100 dark:bg-green-900 border-b-2 border-green-400 dark:border-green-500',
  }))
}
