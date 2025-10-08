/**
 * Cover Letter History - Step 30
 * Version history with restore functionality
 */

import { useCoverLetterStore } from '@/stores/coverLetter.store'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'

export default function CLHistory() {
  const { items, activeId, updateContent } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)

  if (!doc) return null

  return (
    <div className="space-y-2">
      <div className="font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        History
      </div>
      <div className="space-y-2 max-h-60 overflow-auto">
        {doc.history.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-2 rounded-md border text-sm"
          >
            <div>
              {new Date(h.at).toLocaleString()}{' '}
              {h.note ? `• ${h.note}` : ''}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateContent(doc.meta.id, h.content, 'restore')}
            >
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
