/**
 * Unit tests for Resume Picker Service
 */

import { describe, it, expect, vi } from 'vitest';
import { pickFiles } from '@/services/apply/resumePicker.service';

// Mock the export services
vi.mock('@/services/export/variantExport.service', () => ({
  exportVariantToPDF: vi.fn().mockResolvedValue('cv.pdf')
}));

vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn().mockResolvedValue('cover-letter.pdf')
}));

vi.mock('@/stores/coverLetter.store', () => ({
  useCoverLetterStore: {
    getState: () => ({
      items: [
        {
          meta: { id: 'cl1' },
          content: '<p>Cover letter content</p>',
          lang: 'en'
        }
      ]
    })
  }
}));

describe('Resume Picker Service', () => {
  it('should return CV file when variant ID is provided', async () => {
    const files = await pickFiles({ variantId: 'variant1' });

    expect(files).toHaveLength(1);
    expect(files[0].type).toBe('cv');
    expect(files[0].url).toBe('cv.pdf');
  });

  it('should return both CV and cover letter when both IDs are provided', async () => {
    const files = await pickFiles({ variantId: 'variant1', coverLetterId: 'cl1' });

    expect(files).toHaveLength(2);
    expect(files[0].type).toBe('cv');
    expect(files[1].type).toBe('coverLetter');
  });

  it('should return empty array when no IDs are provided', async () => {
    const files = await pickFiles({});

    expect(files).toHaveLength(0);
  });
});
