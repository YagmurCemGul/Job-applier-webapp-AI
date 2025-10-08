import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useVariantsStore } from '@/stores/variants.store'
import { useJobsStore } from '@/stores/jobs.store'

interface VariantCreateDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

/**
 * Dialog for creating a new variant
 */
export default function VariantCreateDialog({ open, onOpenChange }: VariantCreateDialogProps) {
  const [name, setName] = useState('')
  const [jobId, setJobId] = useState<string>('')
  const { items: jobs } = useJobsStore()
  const { createFromCurrent } = useVariantsStore()

  const handleCreate = () => {
    if (!name.trim()) return
    
    createFromCurrent(name.trim(), { linkedJobId: jobId || undefined })
    onOpenChange(false)
    setName('')
    setJobId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Create Variant</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Variant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="border rounded-md p-2 w-full"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="">(Optional) Link Saved Job…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} • {j.company}
            </option>
          ))}
        </select>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
