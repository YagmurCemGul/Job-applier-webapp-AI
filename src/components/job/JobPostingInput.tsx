import { useState } from 'react'
import { Briefcase, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { jobService } from '@/services/job.service'
import { JobPosting } from '@/types/job.types'

interface JobPostingInputProps {
  onJobParsed: (job: JobPosting) => void
}

export function JobPostingInput({ onJobParsed }: JobPostingInputProps) {
  const [jobText, setJobText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleParse = async () => {
    if (!jobText.trim()) {
      setError('Please paste a job posting')
      return
    }

    setParsing(true)
    setError(null)
    setSuccess(false)

    try {
      // Simulate AI parsing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const jobPosting = jobService.createJobPosting(jobText)
      setSuccess(true)
      onJobParsed(jobPosting)
    } catch (_err) {
      setError('Failed to parse job posting')
    } finally {
      setParsing(false)
    }
  }

  const handleClear = () => {
    setJobText('')
    setError(null)
    setSuccess(false)
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Job Posting</h3>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Paste the job posting you're applying for. We'll analyze it and optimize your CV
        accordingly.
      </p>

      <Textarea
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Paste the complete job posting here...

Example:
Senior Software Engineer at TechCorp

We are looking for an experienced Senior Software Engineer to join our team...

Requirements:
• 5+ years of experience with React and TypeScript
• Strong knowledge of Node.js and Express
• Experience with AWS and cloud infrastructure
• Excellent communication skills

Responsibilities:
• Design and develop scalable web applications
• Mentor junior developers
• Collaborate with cross-functional teams"
        className="min-h-[300px] font-mono text-sm"
        disabled={parsing}
      />

      <div className="mt-4 flex gap-2">
        <Button onClick={handleParse} disabled={parsing || !jobText.trim()} className="flex-1">
          {parsing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Job Posting'
          )}
        </Button>

        <Button variant="outline" onClick={handleClear} disabled={parsing}>
          Clear
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Job posting analyzed successfully! Check the analysis below.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <strong>Tip:</strong> Include the complete job posting with requirements, responsibilities,
        and preferred qualifications for best results.
      </div>
    </Card>
  )
}
