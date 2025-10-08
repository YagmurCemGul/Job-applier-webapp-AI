import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useATSStore } from '@/stores/ats.store'
import { useATSUIStore } from '@/stores/ats.ui.store'
import { splitAndHighlightJob } from '@/services/ats/highlights.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Job text viewer with keyword highlighting and keyboard navigation
 */
export default function ATSJobTextViewer() {
  const { t } = useTranslation('cv')
  const { parsedJob, result } = useATSStore()
  const { highlights } = useATSUIStore()
  const [monospace, setMonospace] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const rawText = parsedJob?.sections.raw || ''
  const matchedTerms = result?.matchedKeywords || []

  const shouldHighlight = highlights === 'job' || highlights === 'both'
  const highlighted = shouldHighlight
    ? splitAndHighlightJob(rawText, matchedTerms)
    : { html: rawText }

  useEffect(() => {
    if (!containerRef.current) return
    const marks = containerRef.current.querySelectorAll('mark')
    if (marks.length > 0 && currentIndex >= 0 && currentIndex < marks.length) {
      marks[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      marks[currentIndex]?.focus()
    }
  }, [currentIndex])

  const handleNext = () => {
    const marks = containerRef.current?.querySelectorAll('mark') || []
    if (marks.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % marks.length)
    }
  }

  const handlePrev = () => {
    const marks = containerRef.current?.querySelectorAll('mark') || []
    if (marks.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + marks.length) % marks.length)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!rawText) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        {t('ats.details.noJobText', 'No job text available')}
      </Card>
    )
  }

  const marks = containerRef.current?.querySelectorAll('mark') || []

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="monospace-toggle"
            checked={monospace}
            onCheckedChange={setMonospace}
          />
          <Label htmlFor="monospace-toggle" className="text-sm cursor-pointer">
            Monospace
          </Label>
        </div>

        {shouldHighlight && marks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {marks.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              aria-label="Previous highlight"
              className="gap-1"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              aria-label="Next highlight"
              className="gap-1"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className={`max-h-96 overflow-y-auto whitespace-pre-wrap text-sm ${
          monospace ? 'font-mono' : ''
        } focus-within:ring-2 focus-within:ring-ring rounded-md p-2`}
        dangerouslySetInnerHTML={{ __html: highlighted.html }}
      />
    </Card>
  )
}
