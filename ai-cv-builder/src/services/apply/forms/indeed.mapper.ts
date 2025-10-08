/**
 * Indeed Form Mapper
 * Converts job application data to Indeed-compatible format
 */

import type { ApplyPayload } from '@/types/apply.types';

export function mapIndeed(args: {
  jobUrl: string;
  cvFile: string;
  clFile?: string;
  answers?: Record<string, string>;
}): ApplyPayload {
  return {
    platform: 'indeed',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'resume.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'cover_letter.pdf', type: 'coverLetter' as const, url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {}
  };
}
