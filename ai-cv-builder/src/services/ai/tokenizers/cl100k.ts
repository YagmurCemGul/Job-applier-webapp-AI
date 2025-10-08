/**
 * Approximate token estimator for text
 * Uses simple heuristics: ~4 chars per token for English, ~3 for Turkish
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Very rough heuristic: 1 token ≈ 4 chars English; 1 token ≈ 3 chars TR
  const isTR = /[çğıöşüÇĞİÖŞÜ]/.test(text);
  const div = isTR ? 3.0 : 4.0;
  return Math.ceil(text.length / div);
}
