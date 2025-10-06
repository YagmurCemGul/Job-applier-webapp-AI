import { useVariantsStore } from '@/store/variantsStore'
import VariantRow from './VariantRow'
import { useTranslation } from 'react-i18next'

export default function VariantList() {
  const { t } = useTranslation()
  const { items } = useVariantsStore()

  return (
    <div className="space-y-2">
      {items.map((v) => (
        <VariantRow key={v.meta.id} v={v} />
      ))}
      {!items.length && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {t('variants.noVariants')}
        </div>
      )}
    </div>
  )
}
