import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SaveSearchDialog from './SaveSearchDialog'
import { useState } from 'react'
import { useJobSearchesStore } from '@/store/jobSearchesStore'

export default function JobFilters() {
  const [q, setQ] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const { searches } = useJobSearchesStore()

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex gap-2">
        <Input
          className="flex-1"
          placeholder="Search jobs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={() => setSaveOpen(true)}>Save Search</Button>
      </div>

      {searches.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Saved: {searches.map((s) => s.name).join(' • ')}
        </div>
      )}

      <SaveSearchDialog open={saveOpen} onOpenChange={setSaveOpen} initialQuery={q} />
    </div>
  )
}
