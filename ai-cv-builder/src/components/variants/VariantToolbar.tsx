import { Button } from '@/components/ui/button'
import { useVariantsStore } from '@/stores/variants.store'
import { useState } from 'react'
import VariantCreateDialog from './VariantCreateDialog'
import ExportPresetDialog from './ExportPresetDialog'

/**
 * Toolbar for variant actions
 */
export default function VariantToolbar() {
  const { activeId } = useVariantsStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button onClick={() => setCreateOpen(true)}>Create Variant</Button>
      <Button variant="outline" disabled={!activeId} onClick={() => setExportOpen(true)}>
        Export…
      </Button>
      <VariantCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ExportPresetDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
