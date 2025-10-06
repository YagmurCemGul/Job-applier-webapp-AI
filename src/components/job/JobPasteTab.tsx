import { useATSStore } from '@/store/atsStore'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

/**
 * Job paste tab - paste job description text
 */
export default function JobPasteTab() {
  const { currentJobText, setJobText, parseJob, isParsing } = useATSStore()
  const debounced = useDebouncedValue(currentJobText, 250)

  const wordCount = debounced.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-3">
      <Textarea
        value={currentJobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Paste the job description here..."
        className="h-56"
        aria-label="Job description"
      />
      <div className="text-xs text-muted-foreground">{wordCount} words</div>
      <Button onClick={parseJob} disabled={isParsing || !currentJobText.trim()}>
        {isParsing ? 'Parsing...' : 'Parse'}
      </Button>
    </div>
  )
}
