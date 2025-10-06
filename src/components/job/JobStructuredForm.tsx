import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobPostingSchema, JobPostingInput } from '@/validation/jobPosting.schema'
import { useATSStore } from '@/store/atsStore'
import { useJobsStore } from '@/store/jobsStore'
import { useCVDataStore } from '@/store/cvDataStore'
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
import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface JobStructuredFormProps {
  existing?: Partial<JobPostingInput>
}

/**
 * Structured job posting form that prefills from parsed job (Step 25)
 */
export default function JobStructuredForm({ existing }: JobStructuredFormProps) {
  const { parsedJob, currentJobText, analyze, isAnalyzing } = useATSStore()
  const { upsertFromForm } = useJobsStore()
  const { currentCV } = useCVDataStore()
  const { toast } = useToast()

  const form = useForm<JobPostingInput>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: parsedJob?.title || '',
      company: parsedJob?.company || '',
      location: parsedJob?.location || '',
      remoteType: parsedJob?.remoteType || 'unknown',
      employmentType: undefined,
      seniority: undefined,
      salary: parsedJob?.salary || undefined,
      source: { url: '', site: '' },
      recruiter: { name: '', email: '' },
      postedAt: undefined,
      deadlineAt: undefined,
      tags: [],
      notes: '',
      rawText: currentJobText || parsedJob?.sections.raw || '',
      parsed: parsedJob || ({} as unknown as any),
      status: 'saved',
      favorite: false,
      ...(existing ?? {}),
    },
  })

  // Auto-sync rawText when currentJobText changes
  useEffect(() => {
    if (currentJobText && !existing) {
      form.setValue('rawText', currentJobText)
    }
  }, [currentJobText, existing])

  // Auto-fill from parsed job when it changes
  useEffect(() => {
    if (parsedJob && !existing) {
      form.setValue('title', parsedJob.title || '')
      form.setValue('company', parsedJob.company || '')
      form.setValue('location', parsedJob.location || '')
      form.setValue('remoteType', parsedJob.remoteType || 'unknown')
      if (parsedJob.salary) {
        form.setValue('salary', parsedJob.salary)
      }
      form.setValue('parsed', parsedJob)
    }
  }, [parsedJob, existing])

  const onSubmit = async (data: JobPostingInput) => {
    const id = await upsertFromForm({ ...data } as any)
    if (id) {
      toast({
        title: 'Job saved',
        description: 'Job posting has been saved successfully.',
      })
    }
  }

  const handleAnalyze = async () => {
    if (currentCV && parsedJob) {
      await analyze(currentCV)
      toast({
        title: 'Analysis complete',
        description: 'Check the Optimize tab for results.',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input {...form.register('title')} placeholder="Senior Software Engineer" />
          {form.formState.errors.title && (
            <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
          )}
        </Field>

        <Field label="Company">
          <Input {...form.register('company')} placeholder="TechCorp Inc" />
          {form.formState.errors.company && (
            <p className="text-xs text-red-600">{form.formState.errors.company.message}</p>
          )}
        </Field>

        <Field label="Location">
          <Input {...form.register('location')} placeholder="San Francisco, CA" />
        </Field>

        <Field label="Remote Type">
          <Select
            onValueChange={(v) => form.setValue('remoteType', v as any)}
            defaultValue={form.getValues('remoteType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Employment Type">
          <Select
            onValueChange={(v) => form.setValue('employmentType', v as any)}
            defaultValue={form.getValues('employmentType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
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
        </Field>

        <Field label="Seniority">
          <Select
            onValueChange={(v) => form.setValue('seniority', v as any)}
            defaultValue={form.getValues('seniority')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
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
        </Field>

        <Field label="Source URL">
          <Input placeholder="https://…" {...form.register('source.url')} />
        </Field>

        <Field label="Source Site">
          <Input
            placeholder="linkedin / indeed / glassdoor / kariyer"
            {...form.register('source.site')}
          />
        </Field>

        <Field label="Salary Min">
          <Input type="number" {...form.register('salary.min', { valueAsNumber: true })} />
        </Field>

        <Field label="Salary Max">
          <Input type="number" {...form.register('salary.max', { valueAsNumber: true })} />
        </Field>

        <Field label="Currency">
          <Input placeholder="USD / EUR / TRY" {...form.register('salary.currency')} />
        </Field>

        <Field label="Period">
          <Select
            onValueChange={(v) => form.setValue('salary.period', v as any)}
            defaultValue={form.getValues('salary.period')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="y">Year</SelectItem>
              <SelectItem value="m">Month</SelectItem>
              <SelectItem value="d">Day</SelectItem>
              <SelectItem value="h">Hour</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Tags (comma separated)">
        <Input
          placeholder="ai, react, product, fintech"
          onBlur={(e) => {
            const arr = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            form.setValue('tags', arr)
          }}
        />
      </Field>

      <Field label="Notes">
        <Textarea rows={4} {...form.register('notes')} placeholder="Personal notes..." />
      </Field>

      <Field label="Raw Text (from parser)">
        <Textarea rows={6} {...form.register('rawText')} />
        {form.formState.errors.rawText && (
          <p className="text-xs text-red-600">{form.formState.errors.rawText.message}</p>
        )}
      </Field>

      <div className="flex gap-2">
        <Button type="submit">Save Job</Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAnalyze}
          disabled={!parsedJob || isAnalyzing || !currentCV}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with current CV'}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
