import { useCoverLetterStore } from '@/store/coverLetterStore'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

export default function CLHistory() {
  const { items, activeId, updateContent } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)

  if (!doc || doc.history.length <= 1) return null

  return (
    <div className="space-y-2">
      <div className="font-semibold">History</div>
      <div className="space-y-1">
        {doc.history.slice(0, 10).map((h) => (
          <div key={h.id} className="flex items-center justify-between p-2 rounded-md border text-sm">
            <div className="truncate">
              {new Date(h.at).toLocaleString()} {h.note ? `• ${h.note}` : ''}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateContent(doc.meta.id, h.content, 'restore')}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
