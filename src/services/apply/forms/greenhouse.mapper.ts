import type { ApplyPayload } from '@/types/apply.types'

/**
 * Greenhouse form mapper
 */
export function mapGreenhouse(args: {
  jobUrl: string
  cvFile: string
  clFile?: string
  answers?: Record<string, string>
}): ApplyPayload {
  return {
    platform: 'greenhouse',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'cv.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'cover-letter.pdf', type: 'coverLetter', url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {}
  }
}
