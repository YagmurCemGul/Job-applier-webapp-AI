import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import CLSavedRow from './CLSavedRow'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CLEditor from './CLEditor'
import CLPreview from './CLPreview'
import type { CoverLetterDoc } from '@/types/coverletter.types'
import { Search } from 'lucide-react'

export default function CLSavedList() {
  const { items, select } = useCoverLetterStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const t = q.toLowerCase()
    return items.filter((d) => {
      const blob =
        `${d.meta.name} ${d.variables?.Company ?? ''} ${d.variables?.Role ?? ''}`.toLowerCase()
      return blob.includes(t)
    })
  }, [q, items])

  const handleOpen = (d: CoverLetterDoc) => {
    select(d.meta.id)
    setOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Saved Cover Letters</div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search cover letters…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {filtered.map((d) => (
          <CLSavedRow key={d.meta.id} d={d} onOpen={handleOpen} />
        ))}
      </div>
      {!filtered.length && (
        <div className="p-4 text-center text-sm text-muted-foreground">No cover letters found.</div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Cover Letter</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <CLEditor />
            <CLPreview />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
