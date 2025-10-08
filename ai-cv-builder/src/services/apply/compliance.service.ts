/**
 * Auto-Apply Compliance Service
 * Ensures legal compliance: user must explicitly opt-in for each domain/platform
 */

export const applyCompliance = {
  /**
   * Check if auto-apply is allowed based on user opt-in
   */
  check(optIn: boolean) {
    if (!optIn) {
      return { ok: false as const, reason: 'optOut' as const };
    }
    return { ok: true as const };
  }
};
