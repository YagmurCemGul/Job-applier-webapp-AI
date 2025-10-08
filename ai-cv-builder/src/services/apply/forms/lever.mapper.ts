/**
 * Lever ATS Form Mapper
 * Converts job application data to Lever-compatible format
 */

import type { ApplyPayload } from '@/types/apply.types';

export function mapLever(args: {
  jobUrl: string;
  cvFile: string;
  clFile?: string;
  answers?: Record<string, string>;
}): ApplyPayload {
  return {
    platform: 'lever',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'resume.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'cover-letter.pdf', type: 'coverLetter' as const, url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {}
  };
}
