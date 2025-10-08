import { useTranslation } from 'react-i18next'
import { useATSUIStore, type HighlightsMode } from '@/stores/ats.ui.store'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Highlights toggles with radio group and legend
 */
export default function ATSHighlightsToggles() {
  const { t } = useTranslation('cv')
  const { highlights, showLegend, setHighlights, toggleLegend } = useATSUIStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('ats.details.highlights.title', 'Keyword Highlights')}
          </Label>
          <RadioGroup
            value={highlights}
            onValueChange={(v) => setHighlights(v as HighlightsMode)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="off" id="hl-off" />
              <Label htmlFor="hl-off" className="font-normal cursor-pointer">
                {t('ats.details.highlights.off', 'Off')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="job" id="hl-job" />
              <Label htmlFor="hl-job" className="font-normal cursor-pointer">
                {t('ats.details.highlights.job', 'Job')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cv" id="hl-cv" />
              <Label htmlFor="hl-cv" className="font-normal cursor-pointer">
                {t('ats.details.highlights.cv', 'CV')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="hl-both" />
              <Label htmlFor="hl-both" className="font-normal cursor-pointer">
                {t('ats.details.highlights.both', 'Both')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLegend}
          className="gap-2"
          aria-label={showLegend ? 'Hide legend' : 'Show legend'}
        >
          {showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          Legend
        </Button>
      </div>

      {showLegend && highlights !== 'off' && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900 border-b-2 border-blue-400 dark:border-blue-500"
          >
            {t('ats.details.highlights.legendMatched', 'Matched keyword')}
          </Badge>
          <Badge variant="outline" className="opacity-50">
            {t('ats.details.highlights.legendMissing', 'Missing keyword')}
          </Badge>
        </div>
      )}
    </div>
  )
}
