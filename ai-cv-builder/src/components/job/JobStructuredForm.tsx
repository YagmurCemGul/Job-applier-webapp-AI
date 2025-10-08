import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobPostingSchema, JobPostingInput } from '@/lib/validations/jobPosting.schema'
import { useATSStore } from '@/stores/ats.store'
import { useJobsStore } from '@/stores/jobs.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/useToast'

interface JobStructuredFormProps {
  existing?: Partial<JobPostingInput>
}

/**
 * Structured job posting form with validation
 * Auto-prefills from parsed job (Step 25)
 */
export default function JobStructuredForm({ existing }: JobStructuredFormProps) {
  const { parsedJob, currentJobText, analyze, isAnalyzing } = useATSStore()
  const { upsertFromForm } = useJobsStore()
  const { currentCV } = useCVDataStore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<JobPostingInput>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: parsedJob?.title || '',
      company: parsedJob?.company || '',
      location: parsedJob?.location || '',
      remoteType: parsedJob?.remoteType || 'unknown',
      salary: parsedJob?.salary,
      source: { url: '', site: '' },
      recruiter: { name: '', email: '' },
      postedAt: undefined,
      deadlineAt: undefined,
      tags: [],
      notes: '',
      rawText: currentJobText || parsedJob?.sections.raw || '',
      parsed: parsedJob || ({} as any),
      status: 'saved',
      favorite: false,
      ...(existing ?? {}),
    },
  })

  // Sync rawText when job text changes
  useEffect(() => {
    if (currentJobText) {
      form.setValue('rawText', currentJobText)
    }
  }, [currentJobText, form])

  // Update form when parsedJob changes
  useEffect(() => {
    if (parsedJob && !existing) {
      form.setValue('title', parsedJob.title || '')
      form.setValue('company', parsedJob.company || '')
      form.setValue('location', parsedJob.location || '')
      form.setValue('remoteType', parsedJob.remoteType || 'unknown')
      form.setValue('parsed', parsedJob)
      if (parsedJob.salary) {
        form.setValue('salary', parsedJob.salary)
      }
    }
  }, [parsedJob, form, existing])

  const onSubmit = async (data: JobPostingInput) => {
    setIsSaving(true)
    try {
      const id = await upsertFromForm({ ...data } as any)
      if (id) {
        toast({
          title: 'Success',
          description: 'Job posting saved successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save job posting',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message ?? 'Failed to save job posting',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyze = () => {
    if (currentCV) {
      analyze(currentCV)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Title *">
          <Input {...form.register('title')} placeholder="Senior Frontend Developer" />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
          )}
        </FormField>

        <FormField label="Company *">
          <Input {...form.register('company')} placeholder="Acme Inc." />
          {form.formState.errors.company && (
            <p className="text-sm text-red-500">{form.formState.errors.company.message}</p>
          )}
        </FormField>

        <FormField label="Location">
          <Input {...form.register('location')} placeholder="Istanbul, Turkey / Remote" />
        </FormField>

        <FormField label="Remote Type">
          <Select
            onValueChange={(v) => form.setValue('remoteType', v as any)}
            defaultValue={form.getValues('remoteType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select remote type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Employment Type">
          <Select
            onValueChange={(v) => form.setValue('employmentType', v as any)}
            defaultValue={form.getValues('employmentType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full-time</SelectItem>
              <SelectItem value="part_time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Seniority">
          <Select
            onValueChange={(v) => form.setValue('seniority', v as any)}
            defaultValue={form.getValues('seniority')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select seniority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="na">N/A</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="vp">VP</SelectItem>
              <SelectItem value="c_level">C-Level</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Source URL">
          <Input
            {...form.register('source.url')}
            placeholder="https://linkedin.com/jobs/..."
            type="url"
          />
        </FormField>

        <FormField label="Source Site">
          <Input
            {...form.register('source.site')}
            placeholder="linkedin / indeed / glassdoor / kariyer"
          />
        </FormField>

        <FormField label="Salary Min">
          <Input
            type="number"
            {...form.register('salary.min', { valueAsNumber: true })}
            placeholder="80000"
          />
        </FormField>

        <FormField label="Salary Max">
          <Input
            type="number"
            {...form.register('salary.max', { valueAsNumber: true })}
            placeholder="120000"
          />
        </FormField>

        <FormField label="Currency">
          <Input {...form.register('salary.currency')} placeholder="USD / EUR / TRY" />
        </FormField>

        <FormField label="Period">
          <Select
            onValueChange={(v) => form.setValue('salary.period', v as any)}
            defaultValue={form.getValues('salary.period')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="y">Year</SelectItem>
              <SelectItem value="m">Month</SelectItem>
              <SelectItem value="d">Day</SelectItem>
              <SelectItem value="h">Hour</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Tags (comma separated)">
        <Input
          placeholder="ai, react, product, fintech"
          defaultValue={form.getValues('tags')?.join(', ')}
          onBlur={(e) => {
            const arr = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            form.setValue('tags', arr)
          }}
        />
      </FormField>

      <FormField label="Notes">
        <Textarea rows={4} {...form.register('notes')} placeholder="Additional notes..." />
      </FormField>

      <FormField label="Raw Text (from parser)">
        <Textarea
          rows={6}
          {...form.register('rawText')}
          placeholder="Job posting text..."
          className="font-mono text-xs"
        />
        {form.formState.errors.rawText && (
          <p className="text-sm text-red-500">{form.formState.errors.rawText.message}</p>
        )}
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Job'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAnalyze}
          disabled={!parsedJob || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with current CV'}
        </Button>
      </div>
    </form>
  )
}

/**
 * Reusable form field wrapper with label
 */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
