/**
 * Snapshot ATS result at variant creation time
 */
export function snapshotATSAtCreation() {
  try {
    const { useATSStore } = require('@/store/atsStore')
    const r = useATSStore.getState().result
    if (!r) return undefined
    return {
      score: r.score,
      matched: r.matchedKeywords.length,
      missing: r.missingKeywords.length,
    }
  } catch {
    return undefined
  }
}
