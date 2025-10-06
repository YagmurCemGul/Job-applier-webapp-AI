/**
 * Safety gate with simple heuristic checks
 * Pre-check: before sending to AI
 * Post-check: after receiving from AI
 */

export const safetyGate = {
  async preCheck(req: { prompt?: string; contentToCheck?: string }) {
    const text = req.contentToCheck ?? req.prompt ?? ''
    const risky = /(?:explosive|self-harm|hate|nsfw|credit card|ssn|password)/i.test(text)

    return {
      allowed: !risky,
      flags: risky ? ['heuristic-pre'] : [],
    }
  },

  async postCheck(text: string) {
    const risky = /(?:<script>|javascript:|data:)/i.test(text)

    return {
      allowed: !risky,
      flags: risky ? ['xss-like'] : [],
    }
  },
}
