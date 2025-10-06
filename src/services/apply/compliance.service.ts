/**
 * Auto-apply compliance service
 * Requires explicit user opt-in for each submission
 */
export const applyCompliance = {
  check(optIn: boolean): { ok: boolean; reason?: 'optOut' } {
    if (!optIn) {
      return { ok: false, reason: 'optOut' }
    }
    return { ok: true }
  }
}
