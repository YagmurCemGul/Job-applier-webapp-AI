import type { ApplyPayload } from '@/types/apply.types'

/**
 * Workday form mapper
 */
export function mapWorkday(args: {
  jobUrl: string
  cvFile: string
  clFile?: string
  answers?: Record<string, string>
}): ApplyPayload {
  return {
    platform: 'workday',
    jobUrl: args.jobUrl,
    files: [
      { id: 'cv', name: 'resume.pdf', type: 'cv', url: args.cvFile },
      ...(args.clFile
        ? [{ id: 'cl', name: 'cover_letter.pdf', type: 'coverLetter', url: args.clFile }]
        : [])
    ],
    answers: args.answers ?? {},
    extra: {
      workdayLocale: 'en-US'
    }
  }
}
