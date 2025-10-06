import { z } from 'zod'

export const jobPostingSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  location: z.string().optional(),
  remoteType: z.enum(['remote', 'hybrid', 'onsite', 'unknown']),
  employmentType: z
    .enum(['full_time', 'part_time', 'contract', 'intern', 'temporary', 'freelance', 'other'])
    .optional(),
  seniority: z
    .enum([
      'intern',
      'junior',
      'mid',
      'senior',
      'lead',
      'manager',
      'director',
      'vp',
      'c_level',
      'na',
    ])
    .optional(),
  salary: z
    .object({
      min: z.number().int().positive().optional(),
      max: z.number().int().positive().optional(),
      currency: z.string().max(6).optional(),
      period: z.enum(['y', 'm', 'd', 'h']).optional(),
    })
    .optional(),
  source: z
    .object({
      url: z.string().url().optional().or(z.literal('')),
      site: z.string().optional(),
    })
    .optional(),
  recruiter: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
    })
    .optional(),
  postedAt: z.date().optional(),
  deadlineAt: z.date().optional(),
  tags: z.array(z.string().min(1)).max(20).optional(),
  notes: z.string().max(4000).optional(),
  rawText: z.string().min(20, 'Raw text must be at least 20 characters'),
  parsed: z.any(),
  status: z.enum(['saved', 'applied', 'interview', 'offer', 'rejected']).optional(),
  favorite: z.boolean().optional(),
})

export type JobPostingInput = z.infer<typeof jobPostingSchema>
