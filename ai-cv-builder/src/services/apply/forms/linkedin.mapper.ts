/**
 * LinkedIn Easy Apply Form Mapper
 * Converts job application data to LinkedIn-compatible format
 */

import type { ApplyPayload } from '@/types/apply.types';

export function mapLinkedIn(args: {
  jobUrl: string;
  cvFile: string;
  clFile?: string;
  answers?: Record<string, string>;
}): ApplyPayload {
  return {
    platform: 'linkedin',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'CV.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'Cover Letter.pdf', type: 'coverLetter' as const, url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {}
  };
}
