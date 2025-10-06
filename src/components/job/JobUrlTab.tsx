import { useState } from 'react'
import { useATSStore } from '@/store/atsStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchJobUrl } from '@/lib/fetchJobUrl'
import { AlertCircle } from 'lucide-react'

/**
 * Job URL tab - fetch job from URL
 */
export default function JobUrlTab() {
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string>()
  const { setJobText, parseJob, isParsing } = useATSStore()

  const handleFetch = async () => {
    setFetching(true)
    setFetchError(undefined)
    const r = await fetchJobUrl(url)
    setFetching(false)

    if (r.ok && r.text) {
      setJobText(r.text)
      setFetchError(undefined)
    } else {
      setFetchError(r.error ?? 'Failed to fetch URL')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          type="url"
          aria-label="Job posting URL"
        />
        <Button onClick={handleFetch} disabled={!url || fetching}>
          {fetching ? 'Fetching...' : 'Fetch'}
        </Button>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{fetchError}</span>
        </div>
      )}

      <Button onClick={parseJob} disabled={isParsing}>
        {isParsing ? 'Parsing...' : 'Parse'}
      </Button>

      <p className="text-xs text-muted-foreground">
        Note: Some sites block CORS. Add a server proxy in later steps if required.
      </p>
    </div>
  )
}
