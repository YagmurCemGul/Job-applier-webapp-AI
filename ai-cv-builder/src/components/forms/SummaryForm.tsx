import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Sparkles } from 'lucide-react'
import { useCVDataStore } from '@/stores/cvData.store'

interface SummaryFormData {
  summary: string
}

export function SummaryForm() {
  const { currentCV, updateSummary } = useCVDataStore()

  const { register, watch, setValue } = useForm<SummaryFormData>({
    defaultValues: {
      summary: currentCV?.summary || '',
    },
  })

  const summaryValue = watch('summary')
  const wordCount = summaryValue ? summaryValue.split(/\s+/).filter(Boolean).length : 0
  const charCount = summaryValue?.length || 0

  // Auto-save on change
  useEffect(() => {
    const subscription = watch((data) => {
      if (data.summary !== undefined) {
        updateSummary(data.summary)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, updateSummary])

  const handleGenerateWithAI = () => {
    // This will be implemented later when we add AI summary generation
    console.log('Generate with AI clicked')
  }

  const summaryTemplates = [
    'Results-driven [Your Role] with [X] years of experience in [Industry/Field]. Proven track record in [Key Achievement]. Seeking to leverage expertise in [Skills] to drive [Company Goal].',
    'Innovative [Your Role] specializing in [Area of Expertise]. Known for [Key Strength] and ability to [Notable Skill]. Passionate about [Industry Interest] and committed to [Professional Value].',
    'Dynamic professional with expertise in [Primary Skill], [Secondary Skill], and [Tertiary Skill]. Successfully [Major Achievement]. Looking to contribute [Your Value] to a forward-thinking organization.',
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Professional Summary</h3>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleGenerateWithAI}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            {...register('summary')}
            placeholder="Write a brief professional summary that highlights your experience, skills, and career goals..."
            className="min-h-[150px] mt-2"
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3 text-xs text-gray-500">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
            
            <div className="flex gap-2">
              {wordCount < 50 && (
                <Badge variant="outline" className="text-yellow-600">
                  Add more details
                </Badge>
              )}
              {wordCount >= 50 && wordCount <= 150 && (
                <Badge variant="outline" className="text-green-600">
                  Good length
                </Badge>
              )}
              {wordCount > 150 && (
                <Badge variant="outline" className="text-orange-600">
                  Consider shortening
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="pt-4 border-t">
          <Label className="text-sm mb-3 block">Summary Templates</Label>
          <div className="space-y-2">
            {summaryTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => setValue('summary', template)}
                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> Keep your summary concise (50-150 words) and focus on your 
            most relevant experience and achievements. Tailor it to the specific job you're applying for.
          </p>
        </div>
      </div>
    </Card>
  )
}
