import { useState, useEffect } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVTextPreview } from '@/components/cv/CVTextPreview'
import { CVPreviewFull } from '@/components/cv/CVPreviewFull'
import { JobPostingInput } from '@/components/job/JobPostingInput'
import { JobAnalysisDisplay } from '@/components/job/JobAnalysisDisplay'
import JobInput from '@/components/job/JobInput'
import JobInputTabs from '@/components/job/JobInputTabs'
import ATSPanel from '@/components/ats/ATSPanel'
import { ATSScore } from '@/components/optimization/ATSScore'
import { OptimizationChanges } from '@/components/optimization/OptimizationChanges'
import { ExportOptions } from '@/components/export/ExportOptions'
import { CoverLetterGenerator } from '@/components/cover-letter/CoverLetterGenerator'
import { CoverLetterPreview } from '@/components/cover-letter/CoverLetterPreview'
import { TemplateSelector } from '@/components/templates/TemplateSelector'
import { TemplateCustomization } from '@/components/templates/TemplateCustomization'
import { PersonalInfoForm } from '@/components/forms/PersonalInfoForm'
import { ExperienceForm } from '@/components/forms/ExperienceForm'
import { SummaryForm } from '@/components/forms/SummaryForm'
import { EducationForm } from '@/components/forms/EducationForm'
import { SkillsForm } from '@/components/forms/SkillsForm'
import { ProjectsForm } from '@/components/forms/ProjectsForm'
import { SaveCVDialog } from '@/components/cv/SaveCVDialog'
import { ParsedCVData } from '@/services/file.service'
import { JobPosting } from '@/types/job.types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, AlertCircle, FileText, LayoutTemplate, FileEdit, PanelLeftClose, PanelRightClose, Target } from 'lucide-react'
import { aiService } from '@/services/ai.service'
import { LivePreview } from '@/components/preview/LivePreview'
import { useOptimizationStore } from '@/store/optimizationStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { useTemplateStore } from '@/stores/template.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { useATSStore } from '@/stores/ats.store'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'job' | 'optimize' | 'ats-optimize' | 'cover-letter' | 'template'>('upload')
  const [showPreview, setShowPreview] = useState(true)

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

  const { currentLetter } = useCoverLetterStore()
  const { initializeTemplates } = useTemplateStore()
  const { initializeCV, currentCV: cvData } = useCVDataStore()
  const { parsedJob, analyze, isAnalyzing } = useATSStore()

  // Initialize templates and CV data on mount
  useEffect(() => {
    initializeTemplates()
    initializeCV()
  }, [])

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI CV Builder</h1>
          <p className="text-gray-600">
            Upload your CV and paste the job posting to get ATS-optimized results
          </p>
        </div>

        <SaveCVDialog />
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="upload">1. Upload CV</TabsTrigger>
          <TabsTrigger value="edit">
            <FileEdit className="h-4 w-4 mr-2" />
            2. Edit
          </TabsTrigger>
          <TabsTrigger value="job" disabled={!parsedCV}>
            3. Job
          </TabsTrigger>
          <TabsTrigger value="ats-optimize" disabled={!parsedJob}>
            <Target className="h-4 w-4 mr-2" />
            ATS Optimize
          </TabsTrigger>
          <TabsTrigger value="optimize" disabled={!canOptimize}>
            4. AI Optimize
          </TabsTrigger>
          <TabsTrigger value="cover-letter" disabled={!canOptimize}>
            <FileText className="h-4 w-4 mr-2" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="template">
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CVUpload onUploadComplete={handleCVUpload} />
            {parsedCV && <CVTextPreview text={parsedCV.text} metadata={parsedCV.metadata} />}
          </div>
          
          {parsedCV && (
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setCurrentStep('edit')}>
                Continue to Edit →
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Edit Tab with Split View */}
        <TabsContent value="edit" className="mt-6">
          <div className="flex gap-6">
            {/* Forms Column */}
            <div className={`transition-all duration-300 ${showPreview ? 'w-1/2' : 'w-full'}`}>
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <PanelRightClose className="h-4 w-4 mr-2" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <PanelLeftClose className="h-4 w-4 mr-2" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-6 pr-4">
                  <PersonalInfoForm />
                  <SummaryForm />
                  <ExperienceForm />
                  <EducationForm />
                  <SkillsForm />
                  <ProjectsForm />
                </div>
              </ScrollArea>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                  ← Back to Upload
                </Button>
                <Button onClick={() => setCurrentStep('job')}>
                  Continue to Job Posting →
                </Button>
              </div>
            </div>

            {/* Preview Column */}
            {showPreview && (
              <div className="w-1/2">
                <div className="sticky top-0">
                  <LivePreview />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="job" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <JobInputTabs />
              
              {parsedJob && cvData && (
                <Button
                  className="w-full"
                  onClick={() => {
                    analyze(cvData)
                    setCurrentStep('ats-optimize')
                  }}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Analyze Against CV
                    </>
                  )}
                </Button>
              )}
            </div>

            <div>
              {showPreview && (
                <div className="sticky top-0">
                  <LivePreview />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('edit')}>
              ← Back to Edit
            </Button>
            {parsedJob && (
              <Button onClick={() => setCurrentStep('ats-optimize')}>
                Continue to ATS Optimize →
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ats-optimize" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">ATS Optimization</h3>
                <ATSPanel />
              </Card>
            </div>

            <div>
              {showPreview && (
                <div className="sticky top-0">
                  <LivePreview />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('job')}>
              ← Back to Job
            </Button>
            <Button onClick={() => setCurrentStep('optimize')}>
              Continue to AI Optimize →
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          {result ? (
            <div className="space-y-6">
              {/* Top Section: Score + Suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ATSScore
                  score={result.atsScore}
                  matchingSkills={result.matchingSkills}
                  missingSkills={result.missingSkills}
                />
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
                  <ScrollArea className="h-[200px]">
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </Card>
              </div>

              {/* Changes Section */}
              <OptimizationChanges changes={result.changes} />

              {/* Preview & Export Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CVPreviewFull 
                    content={currentCV || result.optimizedCV}
                    atsScore={result.atsScore}
                  />
                </div>
                <div>
                  <ExportOptions
                    content={currentCV || result.optimizedCV}
                    fileName={`CV_Optimized_${new Date().toISOString().split('T')[0]}`}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep('job')
                    resetOptimization()
                  }}
                >
                  ← Start Over
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    Print CV
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Optimizing your CV with AI...</p>
            </div>
          )}
        </TabsContent>

        {/* Template Tab */}
        <TabsContent value="template" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemplateSelector />
            <TemplateCustomization />
          </div>
        </TabsContent>

        {/* Cover Letter Tab */}
        <TabsContent value="cover-letter" className="mt-6">
          {parsedCV && jobPosting ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <CoverLetterGenerator
                  cvText={parsedCV.text}
                  jobPosting={jobPosting.rawText}
                  jobTitle={jobPosting.parsed.title}
                  companyName={jobPosting.parsed.company}
                />
              </div>

              <div>
                {currentLetter ? (
                  <CoverLetterPreview letter={currentLetter} />
                ) : (
                  <Card className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Cover Letter Yet
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Click "Generate Cover Letter" to create a personalized cover letter
                      based on your CV and the job posting.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Alert>
                <AlertDescription>
                  Please upload your CV and add a job posting first.
                </AlertDescription>
              </Alert>
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