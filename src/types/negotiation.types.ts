/**
 * Negotiation planning types
 */

export interface NegotiationPlan {
  id: string
  offerId: string
  strategy: string // narrative guidance
  talkingPoints: string[] // bullet points
  targetAdjustments: Array<{
    field: 'base' | 'bonus' | 'equity' | 'signing' | 'pto' | 'other'
    askPct?: number
    askAbs?: number
    rationale: string
  }>
  riskNotes?: string[]
  batna?: string // best alternative
  emails?: Array<{
    id: string
    subject: string
    bodyHtml: string
  }>
}
