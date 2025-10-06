import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { coverLetterService } from '@/services/coverLetter.service'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { COVER_LETTER_TONES, COVER_LETTER_LENGTHS } from '@/types/coverLetter.types'

interface CoverLetterGeneratorProps {
  cvText: string
  jobPosting: string
  jobTitle?: string
  companyName?: string
}

export function CoverLetterGenerator({
  cvText,
  jobPosting,
  jobTitle,
  companyName,
}: CoverLetterGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState('')
  const [tone, setTone] = useState<string>('professional')
  const [length, setLength] = useState<string>('medium')

  const { isGenerating, error, setCurrentLetter, setGenerating, setError } = useCoverLetterStore()

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)

    try {
      const result = await coverLetterService.generateCoverLetter({
        cvText,
        jobPosting,
        jobTitle,
        companyName,
        customPrompt: customPrompt || undefined,
        tone: tone as any,
        length: length as any,
      })

      setCurrentLetter(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Generate Cover Letter</h3>
      </div>

      <div className="space-y-4">
        {/* Tone Selection */}
        <div>
          <Label htmlFor="tone">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COVER_LETTER_TONES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Length Selection */}
        <div>
          <Label htmlFor="length">Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger id="length">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COVER_LETTER_LENGTHS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Prompt */}
        <div>
          <Label htmlFor="customPrompt">Additional Instructions (Optional)</Label>
          <Textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., 'Emphasize my leadership experience' or 'Mention my passion for sustainable technology'"
            className="min-h-[100px]"
            disabled={isGenerating}
          />
          <p className="mt-1 text-xs text-gray-500">
            Add specific points you want to highlight or any special requirements
          </p>
        </div>

        {/* Generate Button */}
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Cover Letter...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Cover Letter
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> The AI will create a personalized cover letter based on your CV
            and the job posting. You can customize the tone and add specific instructions to make it
            even more tailored.
          </p>
        </div>
      </div>
    </Card>
  )
}
