import { describe, it, expect } from 'vitest'
import { parseOfferFromText } from '@/services/offer/importers.service'

describe('importers.service', () => {
  it('should parse base salary and company', () => {
    const text = `
      Congratulations! We are pleased to offer you the position of
      Senior Engineer at Acme Corp.
      
      Base Salary: $150,000 USD
      Bonus: 15%
      Signing Bonus: $20,000
    `

    const parsed = parseOfferFromText(text)

    expect(parsed.company).toBe('Acme Corp')
    expect(parsed.baseAnnual).toBe(150000)
    expect(parsed.bonusTargetPct).toBe(15)
    expect(parsed.currency).toBe('USD')
    expect(parsed.benefits?.signingBonus).toBe(20000)
  })

  it('should handle different formats', () => {
    const text = 'Salary $120,000, bonus 10%, from TechCo'

    const parsed = parseOfferFromText(text)

    expect(parsed.baseAnnual).toBe(120000)
    expect(parsed.bonusTargetPct).toBe(10)
  })

  it('should extract PTO days', () => {
    const text = 'Base $100k, 25 days PTO'

    const parsed = parseOfferFromText(text)

    expect(parsed.benefits?.ptoDays).toBe(25)
  })

  it('should handle missing fields gracefully', () => {
    const text = 'Just a random text'

    const parsed = parseOfferFromText(text)

    expect(parsed.baseAnnual).toBeUndefined()
    expect(parsed.company).toBeUndefined()
  })
})
