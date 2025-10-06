import { useState } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVPreview } from '@/components/cv/CVPreview'
import { JobPostingInput } from '@/components/job/JobPostingInput'
import { JobAnalysisDisplay } from '@/components/job/JobAnalysisDisplay'
import { ParsedCVData } from '@/services/file.service'
import { JobPosting } from '@/types/job.types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CVBuilderStep = 'upload' | 'job' | 'optimize'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [currentStep, setCurrentStep] = useState<CVBuilderStep>('upload')

  const handleCVUpload = (data: ParsedCVData) => {
    setParsedCV(data)
    setTimeout(() => setCurrentStep('job'), 1000)
  }

  const handleJobParsed = (job: JobPosting) => {
    setJobPosting(job)
    setTimeout(() => setCurrentStep('optimize'), 500)
  }

  const canProceed = parsedCV !== null && jobPosting !== null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">AI CV Builder</h1>
        <p className="text-gray-600">
          Upload your CV and paste the job posting to get ATS-optimized results
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <StepIndicator
          step={1}
          label="Upload CV"
          active={currentStep === 'upload'}
          completed={parsedCV !== null}
        />
        <div className="h-0.5 w-12 bg-gray-300" />
        <StepIndicator
          step={2}
          label="Job Posting"
          active={currentStep === 'job'}
          completed={jobPosting !== null}
        />
        <div className="h-0.5 w-12 bg-gray-300" />
        <StepIndicator
          step={3}
          label="Optimize"
          active={currentStep === 'optimize'}
          completed={canProceed}
        />
      </div>

      {/* Main Content */}
      <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as CVBuilderStep)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">1. Upload CV</TabsTrigger>
          <TabsTrigger value="job" disabled={!parsedCV}>
            2. Job Posting
          </TabsTrigger>
          <TabsTrigger value="optimize" disabled={!canProceed}>
            3. Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CVUpload onUploadSuccess={handleCVUpload} />
            {parsedCV && <CVPreview data={parsedCV} />}
          </div>

          {parsedCV && (
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setCurrentStep('job')}>Continue to Job Posting →</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="job" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <JobPostingInput onJobParsed={handleJobParsed} />
            {jobPosting && <JobAnalysisDisplay job={jobPosting} />}
          </div>

          {jobPosting && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                ← Back to CV
              </Button>
              <Button onClick={() => setCurrentStep('optimize')}>Continue to Optimize →</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          <div className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Ready to Optimize!</h2>
            <p className="mb-6 text-gray-600">
              We have your CV and the job posting. Next step: AI optimization!
            </p>
            {parsedCV && jobPosting && (
              <div className="mx-auto max-w-2xl space-y-4 text-left">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">CV Information</h3>
                  <p className="text-sm text-gray-600">
                    File: {parsedCV.metadata.fileName} (
                    {(parsedCV.metadata.fileSize / 1024).toFixed(2)} KB)
                  </p>
                  <p className="text-sm text-gray-600">
                    Text length: {parsedCV.text.length} characters
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Job Information</h3>
                  {jobPosting.parsed.title && (
                    <p className="text-sm text-gray-600">Position: {jobPosting.parsed.title}</p>
                  )}
                  {jobPosting.parsed.company && (
                    <p className="text-sm text-gray-600">Company: {jobPosting.parsed.company}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Skills required: {jobPosting.parsed.skills.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Keywords identified: {jobPosting.parsed.keywords.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${completed ? 'bg-green-500 text-white' : ''} ${active && !completed ? 'bg-primary text-white' : ''} ${!active && !completed ? 'bg-gray-200 text-gray-600' : ''} `}
      >
        {completed ? '✓' : step}
      </div>
      <span className={`text-xs ${active ? 'font-medium' : 'text-gray-600'}`}>{label}</span>
    </div>
  )
}
