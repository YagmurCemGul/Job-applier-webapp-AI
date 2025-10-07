import { useState } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVTextPreview } from '@/components/cv/CVTextPreview'
import { JobPostingInput } from '@/components/job/JobPostingInput'
import { JobAnalysisDisplay } from '@/components/job/JobAnalysisDisplay'
import { ATSScore } from '@/components/optimization/ATSScore'
import { OptimizationChanges } from '@/components/optimization/OptimizationChanges'
import { ParsedCVData } from '@/services/file.service'
import { JobPosting } from '@/types/job.types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { aiService } from '@/services/ai.service'
import { useOptimizationStore } from '@/store/optimizationStore'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'job' | 'optimize'>('upload')

  const {
    result,
    isOptimizing,
    error,
    currentCV,
    setResult,
    setOptimizing,
    setError,
    reset: resetOptimization,
  } = useOptimizationStore()

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
          completed={result !== null}
        />
      </div>

      {/* Main Content */}
      <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as any)}>
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
            <Button
              onClick={handleOptimize}
              disabled={!canOptimize || isOptimizing}
            >
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <h3 className="text-lg font-semibold mb-4">Optimized CV Preview</h3>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <pre className="text-sm whitespace-pre-wrap">
                      {currentCV || result.optimizedCV}
                    </pre>
                  </ScrollArea>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('job')}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button 
                      onClick={() => {
                        const blob = new Blob([currentCV || result.optimizedCV], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'optimized-cv.txt'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex-1"
                    >
                      Download CV
                    </Button>
                  </div>
                </Card>

                {result.suggestions.length > 0 && (
                  <Card className="p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
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