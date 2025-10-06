import { describe, it, expect, vi } from 'vitest'
import { exportCoverLetter } from '@/services/coverletter/clExport.service'
import type { CoverLetterDoc } from '@/types/coverletter.types'

describe('clExport.service', () => {
  const mockDoc: CoverLetterDoc = {
    meta: {
      id: 'cl-1',
      name: 'Test CL',
      linkedJobId: 'job-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    content: '<p>Hello, I am applying for the Backend Engineer position at TechCorp.</p>',
    tone: 'formal',
    length: 'medium',
    lang: 'en',
    templateId: 'cl-01',
    variables: {
      YourName: 'John Doe',
      Company: 'TechCorp',
      Role: 'Backend Engineer',
    },
    history: [],
  }

  it('should export as PDF (stub)', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    await exportCoverLetter(mockDoc, 'pdf')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Exporting PDF'))
  })

  it('should export as DOCX (stub)', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    await exportCoverLetter(mockDoc, 'docx')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Exporting DOCX'))
  })

  it('should export as Google Doc (stub)', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    await exportCoverLetter(mockDoc, 'gdoc')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Exporting Google Doc'))
  })

  it('should generate filename with variables', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    await exportCoverLetter(mockDoc, 'pdf')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('John'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Doe'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TechCorp'))
  })
})
