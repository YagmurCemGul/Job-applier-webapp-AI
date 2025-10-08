/**
 * Greenhouse ATS Form Mapper
 * Converts job application data to Greenhouse-compatible format
 */

import type { ApplyPayload } from '@/types/apply.types';

export function mapGreenhouse(args: {
  jobUrl: string;
  cvFile: string;
  clFile?: string;
  answers?: Record<string, string>;
}): ApplyPayload {
  return {
    platform: 'greenhouse',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'cv.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'cover-letter.pdf', type: 'coverLetter' as const, url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {}
  };
}
