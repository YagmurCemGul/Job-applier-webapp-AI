import { useVariantsStore } from '@/stores/variants.store'
import { Button } from '@/components/ui/button'

/**
 * Version history for the active variant
 */
export default function VariantHistory() {
  const { activeId, items, revertToHistory } = useVariantsStore()
  const v = items.find((x) => x.meta.id === activeId)
  
  if (!v) return null

  return (
    <div className="space-y-2">
      <div className="font-semibold">History</div>
      {v.history.map((h) => (
        <div key={h.id} className="flex items-center justify-between p-2 rounded-md border">
          <div className="text-sm">
            {new Date(h.at).toLocaleString()} {h.note ? `• ${h.note}` : ''}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => revertToHistory(v.meta.id, h.id)}
          >
            Restore
          </Button>
        </div>
      ))}
    </div>
  )
}
