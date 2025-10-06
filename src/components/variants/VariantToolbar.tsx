import { Button } from '@/components/ui/button'
import { useVariantsStore } from '@/store/variantsStore'
import { useState } from 'react'
import VariantCreateDialog from './VariantCreateDialog'
import ExportPresetDialog from './ExportPresetDialog'
import { Plus, Download } from 'lucide-react'

export default function VariantToolbar() {
  const { activeId } = useVariantsStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => setCreateOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Variant
      </Button>
      <Button variant="outline" disabled={!activeId} onClick={() => setExportOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        Export…
      </Button>
      <VariantCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ExportPresetDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
