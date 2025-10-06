import { useState } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVPreview } from '@/components/cv/CVPreview'
import { JobPostingInput } from '@/components/job/JobPostingInput'
import { JobAnalysisDisplay } from '@/components/job/JobAnalysisDisplay'
import { ATSScore } from '@/components/optimization/ATSScore'
import { OptimizationChanges } from '@/components/optimization/OptimizationChanges'
import { ParsedCVData } from '@/services/file.service'
import { JobPosting } from '@/types/job.types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { aiService } from '@/services/ai.service'
import { useOptimizationStore } from '@/store/optimizationStore'
import { Card } from '@/components/ui/card'

type CVBuilderStep = 'upload' | 'job' | 'optimize'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [currentStep, setCurrentStep] = useState<CVBuilderStep>('upload')

  const { result, isOptimizing, error, setResult, setOptimizing, setError } = useOptimizationStore()

  const handleCVUpload = (data: ParsedCVData) => {
    setParsedCV(data)
    setTimeout(() => setCurrentStep('job'), 1000)
  }

  const handleJobParsed = (job: JobPosting) => {
    setJobPosting(job)
  }

  const handleOptimize = async () => {
    if (!parsedCV || !jobPosting) return

    setOptimizing(true)
    setError(null)

    try {
      const optimizationResult = await aiService.optimizeCV({
        cvText: parsedCV.text,
        jobPosting: jobPosting.rawText,
        jobTitle: jobPosting.parsed.title,
        jobSkills: jobPosting.parsed.skills,
      })

      setResult(optimizationResult)
      setCurrentStep('optimize')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed')
    } finally {
      setOptimizing(false)
    }
  }

  const canOptimize = parsedCV !== null && jobPosting !== null

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
          completed={result !== null}
        />
      </div>

      {/* Main Content */}
      <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as CVBuilderStep)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">1. Upload CV</TabsTrigger>
          <TabsTrigger value="job" disabled={!parsedCV}>
            2. Job Posting
          </TabsTrigger>
          <TabsTrigger value="optimize" disabled={!canOptimize}>
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

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('upload')}>
              ← Back to CV
            </Button>
            <Button onClick={handleOptimize} disabled={!canOptimize || isOptimizing}>
              {isOptimizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize with AI
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          {result ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <ATSScore
                  score={result.atsScore}
                  matchingSkills={result.matchingSkills}
                  missingSkills={result.missingSkills}
                />
                <OptimizationChanges changes={result.changes} />
              </div>

              <div>
                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Optimized CV Preview</h3>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <pre className="whitespace-pre-wrap text-sm">{result.optimizedCV}</pre>
                  </ScrollArea>

                  {result.suggestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">Suggestions</h4>
                      <ul className="space-y-1">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-gray-600">Optimizing your CV with AI...</p>
            </div>
          )}
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
