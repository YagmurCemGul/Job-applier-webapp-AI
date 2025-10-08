import { useState } from 'react'
import { useATSStore } from '@/stores/ats.store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchJobUrl } from '@/lib/fetchJobUrl'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'

/**
 * Tab for fetching job posting from URL
 */
export default function JobUrlTab() {
  const { t } = useTranslation('cv')
  const [url, setUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string>()
  const { setJobText, parseJob, isParsing } = useATSStore()

  const handleFetch = async () => {
    setIsFetching(true)
    setFetchError(undefined)
    const r = await fetchJobUrl(url)
    setIsFetching(false)

    if (r.ok && r.text) {
      setJobText(r.text)
      setFetchError(undefined)
    } else {
      setFetchError(r.error ?? 'Failed to fetch job posting')
    }
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1"
          aria-label="Job posting URL"
        />
        <Button onClick={handleFetch} disabled={!url || isFetching} variant="outline">
          {isFetching ? t('job.fetching', 'Fetching...') : t('job.fetch', 'Fetch')}
        </Button>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{fetchError}</span>
        </div>
      )}

      <Button onClick={parseJob} disabled={isParsing} size="sm">
        {isParsing ? t('job.parsing', 'Parsing...') : t('job.parse', 'Parse')}
      </Button>

      <p className="text-xs text-muted-foreground">
        {t(
          'job.corsNote',
          'Note: Some sites block CORS. Add a server proxy in later steps if required.'
        )}
      </p>
    </div>
  )
}
