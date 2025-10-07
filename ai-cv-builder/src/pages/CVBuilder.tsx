import { useState } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVTextPreview } from '@/components/cv/CVTextPreview'
import { ParsedCVData } from '@/services/file.service'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'edit'>('upload')

  const handleUploadComplete = (data: ParsedCVData) => {
    setParsedCV(data)
    setStep('preview')
  }

  const handleContinue = () => {
    setStep('edit')
    // TODO: Parse the text into CV fields (Step 11)
  }

  const handleReset = () => {
    setParsedCV(null)
    setStep('upload')
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CV Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Create your professional CV in minutes
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            step === 'upload'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          1
        </div>
        <div className="h-0.5 w-12 bg-muted" />
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            step === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          2
        </div>
        <div className="h-0.5 w-12 bg-muted" />
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            step === 'edit'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          3
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && <CVUpload onUploadComplete={handleUploadComplete} />}

      {/* Step 2: Preview */}
      {step === 'preview' && parsedCV && (
        <div className="space-y-4">
          <CVTextPreview text={parsedCV.text} metadata={parsedCV.metadata} />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Upload Different CV
            </Button>
            <Button onClick={handleContinue}>
              Continue to Edit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Edit (Will be implemented in Step 12-19) */}
      {step === 'edit' && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">CV Editor Coming Soon</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This will be implemented in Steps 12-19
          </p>
          <Button onClick={handleReset} variant="outline" className="mt-4">
            Start Over
          </Button>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
}