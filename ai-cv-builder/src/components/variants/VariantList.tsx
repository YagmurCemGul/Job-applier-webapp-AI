import { useVariantsStore } from '@/stores/variants.store'
import VariantRow from './VariantRow'

/**
 * List of all variants
 */
export default function VariantList() {
  const { items } = useVariantsStore()

  return (
    <div className="space-y-2">
      {items.map((v) => (
        <VariantRow key={v.meta.id} v={v} />
      ))}
      {!items.length && (
        <div className="text-sm text-muted-foreground">No variants yet.</div>
      )}
    </div>
  )
}
