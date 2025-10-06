import type { CVVariant } from '@/types/variants.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVariantsStore } from '@/store/variantsStore'
import { useTranslation } from 'react-i18next'
import { Edit2, Camera, Trash2 } from 'lucide-react'

export default function VariantRow({ v }: { v: CVVariant }) {
  const { t } = useTranslation()
  const { select, activeId, rename, delete: remove, addHistory } = useVariantsStore()
  const isActive = activeId === v.meta.id

  const handleRename = () => {
    const next = prompt('Rename variant', v.meta.name)
    if (next) rename(v.meta.id, next)
  }

  return (
    <div className="flex items-center justify-between rounded-md border bg-background p-3 transition-colors hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{v.meta.name}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {v.meta.linkedJobId && (
            <Badge variant="outline" className="text-xs">
              {t('variants.linkedJob')}: {v.meta.linkedJobId}
            </Badge>
          )}
          {v.meta.atsAtCreate && (
            <Badge variant="secondary" className="text-xs">
              {t('variants.atsAtCreate')} {v.meta.atsAtCreate.score}
            </Badge>
          )}
          <span className="text-xs">{new Date(v.meta.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <Button
          size="sm"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => select(v.meta.id)}
        >
          {isActive ? 'Active' : 'Open'}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleRename} aria-label="Rename">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => addHistory(v.meta.id, 'snapshot')}
          aria-label="Snapshot"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => remove(v.meta.id)} aria-label="Delete">
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  )
}
