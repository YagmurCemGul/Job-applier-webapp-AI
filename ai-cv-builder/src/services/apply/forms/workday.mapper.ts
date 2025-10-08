/**
 * Workday ATS Form Mapper
 * Converts job application data to Workday-compatible format
 */

import type { ApplyPayload } from '@/types/apply.types';

export function mapWorkday(args: {
  jobUrl: string;
  cvFile: string;
  clFile?: string;
  answers?: Record<string, string>;
  locale?: string;
}): ApplyPayload {
  return {
    platform: 'workday',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'Resume.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'CoverLetter.pdf', type: 'coverLetter' as const, url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {},
    extra: {
      workdayLocale: args.locale ?? 'en-US'
    }
  };
}
