import { useState } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVTextPreview } from '@/components/cv/CVTextPreview'
import { JobPostingInput } from '@/components/job/JobPostingInput'
import { JobAnalysisDisplay } from '@/components/job/JobAnalysisDisplay'
import { ParsedCVData } from '@/services/file.service'
import { JobPosting } from '@/types/job.types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'job' | 'optimize'>('upload')

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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI CV Builder</h1>
        <p className="text-gray-600">
          Upload your CV and paste the job posting to get ATS-optimized results
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepIndicator
          step={1}
          label="Upload CV"
          active={currentStep === 'upload'}
          completed={parsedCV !== null}
        />
        <div className="w-12 h-0.5 bg-gray-300" />
        <StepIndicator
          step={2}
          label="Job Posting"
          active={currentStep === 'job'}
          completed={jobPosting !== null}
        />
        <div className="w-12 h-0.5 bg-gray-300" />
        <StepIndicator
          step={3}
          label="Optimize"
          active={currentStep === 'optimize'}
          completed={canProceed}
        />
      </div>

      {/* Main Content */}
      <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as any)}>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CVUpload onUploadComplete={handleCVUpload} />
            {parsedCV && <CVTextPreview text={parsedCV.text} metadata={parsedCV.metadata} />}
          </div>
          
          {parsedCV && (
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setCurrentStep('job')}>
                Continue to Job Posting →
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="job" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobPostingInput onJobParsed={handleJobParsed} />
            {jobPosting && <JobAnalysisDisplay job={jobPosting} />}
          </div>

          {jobPosting && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                ← Back to CV
              </Button>
              <Button onClick={() => setCurrentStep('optimize')}>
                Continue to Optimize →
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Optimize!</h2>
            <p className="text-gray-600 mb-4">
              We have your CV and the job posting. Next step: AI optimization!
            </p>
            <div className="mt-6 space-y-2 text-left max-w-2xl mx-auto">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-900">✓ CV Uploaded</div>
                <div className="text-sm text-green-700">
                  {parsedCV?.metadata.fileName} ({parsedCV?.metadata.fileSize} bytes)
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-900">✓ Job Posting Analyzed</div>
                <div className="text-sm text-blue-700">
                  {jobPosting?.parsed.title && `Position: ${jobPosting.parsed.title}`}
                  {jobPosting?.parsed.company && ` at ${jobPosting.parsed.company}`}
                </div>
              </div>
            </div>
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
  completed 
}: { 
  step: number
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
        transition-colors duration-200
        ${completed ? 'bg-green-500 text-white' : ''}
        ${active && !completed ? 'bg-primary text-white' : ''}
        ${!active && !completed ? 'bg-gray-200 text-gray-600' : ''}
      `}>
        {completed ? '✓' : step}
      </div>
      <span className={`text-xs ${active ? 'font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  )
}