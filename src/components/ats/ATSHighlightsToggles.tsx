import { useTranslation } from 'react-i18next'
import { useATSUIStore, type HighlightsMode } from '@/store/atsUIStore'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function ATSHighlightsToggles() {
  const { t } = useTranslation()
  const { highlights, showLegend, setHighlights, toggleLegend } = useATSUIStore()

  const modes: Array<{ value: HighlightsMode; label: string }> = [
    { value: 'off', label: t('ats.details.highlights.off') },
    { value: 'job', label: t('ats.details.highlights.job') },
    { value: 'cv', label: t('ats.details.highlights.cv') },
    { value: 'both', label: t('ats.details.highlights.both') },
  ]

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Highlights</h3>
        <button
          onClick={toggleLegend}
          className="text-xs text-muted-foreground hover:text-foreground"
          aria-label="Toggle legend"
        >
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
      </div>

      <RadioGroup value={highlights} onValueChange={(v) => setHighlights(v as HighlightsMode)}>
        <div className="flex gap-4">
          {modes.map((m) => (
            <div key={m.value} className="flex items-center space-x-2">
              <RadioGroupItem value={m.value} id={`hl-${m.value}`} />
              <Label htmlFor={`hl-${m.value}`} className="cursor-pointer">
                {m.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {showLegend && (
        <div className="flex gap-3 border-t pt-2">
          <Badge variant="outline" className="border-blue-500 bg-blue-50">
            <span className="mr-1 inline-block h-3 w-3 border-b-2 border-blue-500 bg-blue-100" />
            {t('ats.details.highlights.legendMatched')}
          </Badge>
          <Badge variant="outline" className="border-gray-400 bg-gray-50">
            <span className="mr-1 inline-block h-3 w-3 border-b-2 border-gray-400 bg-gray-100" />
            {t('ats.details.highlights.legendMissing')}
          </Badge>
        </div>
      )}
    </div>
  )
}
