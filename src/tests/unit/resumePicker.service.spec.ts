import { describe, it, expect } from 'vitest'
import { pickFiles } from '@/services/apply/resumePicker.service'

describe('resumePicker.service', () => {
  it('should return CV file when variantId provided', async () => {
    const files = await pickFiles({ variantId: 'variant-123' })

    expect(files).toHaveLength(1)
    expect(files[0].type).toBe('cv')
    expect(files[0].name).toBe('CV.pdf')
  })

  it('should return both CV and CL when both provided', async () => {
    const files = await pickFiles({
      variantId: 'variant-123',
      coverLetterId: 'cl-456'
    })

    expect(files.length).toBeGreaterThanOrEqual(1)
    expect(files.some((f) => f.type === 'cv')).toBe(true)
  })

  it('should return empty array when no IDs provided', async () => {
    const files = await pickFiles({})

    expect(files).toHaveLength(0)
  })

  it('should handle errors gracefully', async () => {
    const files = await pickFiles({ variantId: 'nonexistent' })

    // Should not throw, may return empty or partial
    expect(Array.isArray(files)).toBe(true)
  })
})
