import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useVariantsStore } from '@/store/variantsStore'
import { useJobsStore } from '@/store/jobsStore'
import { useTranslation } from 'react-i18next'

export default function VariantCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [jobId, setJobId] = useState<string>('')
  const { items: jobs } = useJobsStore()
  const { createFromCurrent } = useVariantsStore()

  const handleCreate = () => {
    if (!name.trim()) return
    createFromCurrent(name.trim(), { linkedJobId: jobId || undefined })
    setName('')
    setJobId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>{t('variants.create')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="variant-name">Variant Name</Label>
            <Input
              id="variant-name"
              placeholder="e.g., Backend Engineer - Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="linked-job">Linked Job (Optional)</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger id="linked-job">
                <SelectValue placeholder="Select a saved job..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title} • {j.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
