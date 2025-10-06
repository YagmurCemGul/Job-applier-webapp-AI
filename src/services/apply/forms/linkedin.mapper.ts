import type { ApplyPayload } from '@/types/apply.types'

/**
 * LinkedIn form mapper
 */
export function mapLinkedIn(args: {
  jobUrl: string
  cvFile: string
  clFile?: string
  answers?: Record<string, string>
}): ApplyPayload {
  return {
    platform: 'linkedin',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'CV.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'CoverLetter.pdf', type: 'coverLetter', url: args.clFile }]
        : []),
    ],
    answers: args.answers ?? {},
  }
}
