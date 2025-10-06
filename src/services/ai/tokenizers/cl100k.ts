/**
 * Approximate token estimation for text
 * Very rough heuristic: 1 token ≈ 4 chars English; 1 token ≈ 3 chars Turkish
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  // Detect Turkish characters
  const isTR = /[çğıöşüÇĞİÖŞÜ]/.test(text)
  const div = isTR ? 3.0 : 4.0

  return Math.ceil(text.length / div)
}
