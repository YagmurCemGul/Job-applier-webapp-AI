/**
 * Escape special regex characters
 */
export function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Highlight text with <mark> tags
 * - Case-insensitive
 * - Respects word boundaries
 * - Avoids nested marks
 * - XSS-safe (encodes text)
 */
export function highlightText(
  input: string,
  terms: string[],
  attr?: (t: string) => Record<string, string>
): string {
  if (!terms.length || !input) return escapeHtml(input)

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length)

  // Track positions that are already marked
  const markedRanges: Array<[number, number]> = []

  // Find all matches
  const matches: Array<{ start: number; end: number; term: string }> = []

  for (const term of sortedTerms) {
    const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi')
    let match: RegExpExecArray | null

    while ((match = regex.exec(input)) !== null) {
      const start = match.index
      const end = start + match[0].length

      // Check if this range overlaps with existing marks
      const overlaps = markedRanges.some(
        ([ms, me]) => (start >= ms && start < me) || (end > ms && end <= me)
      )

      if (!overlaps) {
        matches.push({ start, end, term })
        markedRanges.push([start, end])
      }
    }
  }

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start)

  // Build result with marks
  let result = ''
  let lastIndex = 0

  for (const { start, end, term } of matches) {
    // Add text before match
    result += escapeHtml(input.slice(lastIndex, start))

    // Add marked text
    const matchedText = input.slice(start, end)
    const attrs = attr ? attr(term) : { 'data-kw': term }
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
      .join(' ')

    result += `<mark ${attrStr} aria-label="keyword: ${escapeHtml(term)}">${escapeHtml(matchedText)}</mark>`
    lastIndex = end
  }

  // Add remaining text
  result += escapeHtml(input.slice(lastIndex))

  return result
}

/**
 * Highlight job posting text
 */
export function splitAndHighlightJob(raw: string, terms: string[]): { html: string } {
  const html = highlightText(raw, terms, (t) => ({
    'data-kw': t,
    class: 'bg-blue-100 border-b-2 border-blue-500',
  }))

  return { html }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
