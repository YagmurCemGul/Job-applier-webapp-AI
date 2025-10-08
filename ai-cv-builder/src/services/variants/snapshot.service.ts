/**
 * Snapshot ATS analysis result at the time of variant creation
 */
export function snapshotATSAtCreation() {
  try {
    const { useATSStore } = require('@/stores/ats.store')
    const r = useATSStore.getState().result
    
    if (!r) return undefined
    
    return {
      score: r.score ?? 0,
      matched: r.matchedKeywords?.length ?? 0,
      missing: r.missingKeywords?.length ?? 0,
    }
  } catch {
    return undefined
  }
}
