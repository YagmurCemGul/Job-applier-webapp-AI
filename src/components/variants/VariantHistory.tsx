import { useVariantsStore } from '@/store/variantsStore'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'

export default function VariantHistory() {
  const { t } = useTranslation()
  const { activeId, items, revertToHistory } = useVariantsStore()
  const v = items.find((x) => x.meta.id === activeId)

  if (!v) return null

  return (
    <div className="space-y-2">
      <div className="font-semibold">{t('variants.history')}</div>
      {v.history.map((h) => (
        <div key={h.id} className="flex items-center justify-between rounded-md border p-2">
          <div className="text-sm">
            {new Date(h.at).toLocaleString()}
            {h.note ? ` • ${h.note}` : ''}
          </div>
          <Button size="sm" variant="outline" onClick={() => revertToHistory(v.meta.id, h.id)}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Restore
          </Button>
        </div>
      ))}
    </div>
  )
}
