/**
 * Combine confidence scores
 */
export function combine(...scores: Array<number | undefined>): number {
  const vals = scores.filter((x): x is number => typeof x === 'number')
  if (!vals.length) return 0
  const s = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.max(0, Math.min(1, s))
}
