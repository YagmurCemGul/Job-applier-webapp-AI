import { useEffect, useRef, useState } from 'react'
import { splitAndHighlightJob } from '@/services/ats/highlights.service'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ATSJobTextViewerProps {
  rawText: string
  terms: string[]
  enabled: boolean
}

export default function ATSJobTextViewer({ rawText, terms, enabled }: ATSJobTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalMarks, setTotalMarks] = useState(0)

  const highlighted = enabled ? splitAndHighlightJob(rawText, terms) : { html: rawText }

  useEffect(() => {
    if (!containerRef.current) return
    const marks = containerRef.current.querySelectorAll('mark')
    setTotalMarks(marks.length)
    setCurrentIndex(0)
  }, [highlighted.html])

  const navigateToMark = (direction: 'next' | 'prev') => {
    if (!containerRef.current || totalMarks === 0) return

    const marks = containerRef.current.querySelectorAll('mark')
    let newIndex = currentIndex

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % totalMarks
    } else {
      newIndex = (currentIndex - 1 + totalMarks) % totalMarks
    }

    setCurrentIndex(newIndex)

    // Scroll to mark
    const mark = marks[newIndex] as HTMLElement
    mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
    mark.focus()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault()
        navigateToMark('next')
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        navigateToMark('prev')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="space-y-2">
      {enabled && totalMarks > 0 && (
        <div className="flex items-center justify-between rounded-md bg-muted p-2">
          <span className="text-sm text-muted-foreground">
            Highlight {currentIndex + 1} of {totalMarks}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToMark('prev')}
              aria-label="Previous highlight (Alt+↑)"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToMark('next')}
              aria-label="Next highlight (Alt+↓)"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="h-96 rounded-md border p-4">
        <div
          ref={containerRef}
          className="whitespace-pre-wrap font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: highlighted.html }}
        />
      </ScrollArea>
    </div>
  )
}
