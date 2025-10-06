import { useState } from 'react'
import { CVUpload } from '@/components/cv/CVUpload'
import { CVPreview } from '@/components/cv/CVPreview'
import { ParsedCVData } from '@/services/file.service'
import { Button } from '@/components/ui/button'

type CVBuilderStep = 'upload' | 'edit' | 'optimize'

export default function CVBuilderPage() {
  const [parsedCV, setParsedCV] = useState<ParsedCVData | null>(null)
  const [currentStep, setCurrentStep] = useState<CVBuilderStep>('upload')

  const handleUploadSuccess = (data: ParsedCVData) => {
    setParsedCV(data)
    // Auto-advance to edit step after successful upload
    setTimeout(() => setCurrentStep('edit'), 1000)
  }

  const handleReset = () => {
    setParsedCV(null)
    setCurrentStep('upload')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">AI CV Builder</h1>
        <p className="text-gray-600">Upload your CV and optimize it for ATS systems</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        <StepIndicator
          step={1}
          label="Upload CV"
          active={currentStep === 'upload'}
          completed={parsedCV !== null}
        />
        <div className="h-px flex-1 bg-gray-200" />
        <StepIndicator
          step={2}
          label="Edit & Optimize"
          active={currentStep === 'edit'}
          completed={false}
        />
        <div className="h-px flex-1 bg-gray-200" />
        <StepIndicator
          step={3}
          label="Download"
          active={currentStep === 'optimize'}
          completed={false}
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <CVUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => console.error(error)}
          />
        </div>

        <div>{parsedCV && <CVPreview data={parsedCV} />}</div>
      </div>

      {/* Navigation */}
      {parsedCV && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleReset}>
            Upload Different CV
          </Button>
          <Button onClick={() => setCurrentStep('edit')}>Continue to Edit</Button>
        </div>
      )}
    </div>
  )
}

// Helper component
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
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${completed ? 'bg-green-500 text-white' : ''} ${active ? 'bg-primary text-white' : ''} ${!active && !completed ? 'bg-gray-200 text-gray-600' : ''} `}
      >
        {step}
      </div>
      <span className={`text-sm ${active ? 'font-medium' : 'text-gray-600'}`}>{label}</span>
    </div>
  )
}
