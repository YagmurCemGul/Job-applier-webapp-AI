import type { CVVariant } from '@/types/variants.types'
import { Button } from '@/components/ui/button'
import { useVariantsStore } from '@/stores/variants.store'

interface VariantRowProps {
  v: CVVariant
}

/**
 * Single variant row with actions
 */
export default function VariantRow({ v }: VariantRowProps) {
  const { select, activeId, rename, delete: remove, addHistory } = useVariantsStore()
  const isActive = activeId === v.meta.id

  const handleRename = () => {
    const next = prompt('Rename variant', v.meta.name)
    if (next) rename(v.meta.id, next)
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-background">
      <div className="min-w-0">
        <div className="font-medium truncate">{v.meta.name}</div>
        <div className="text-xs text-muted-foreground">
          {v.meta.linkedJobId ? `Linked job: ${v.meta.linkedJobId}` : 'No linked job'}
          {v.meta.atsAtCreate ? ` • ATS ${v.meta.atsAtCreate.score}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isActive ? 'default' : 'outline'}
          onClick={() => select(v.meta.id)}
        >
          {isActive ? 'Active' : 'Open'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleRename}>
          Rename
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addHistory(v.meta.id, 'snapshot')}
        >
          Snapshot
        </Button>
        <Button size="sm" variant="destructive" onClick={() => remove(v.meta.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}
