/**
 * Cover Letter Saved List - Step 30
 * List and search saved cover letters
 */

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { useCoverLetterStore } from '@/stores/coverLetter.store'
import CLSavedRow from './CLSavedRow'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import CLEditor from './CLEditor'
import CLPreview from './CLPreview'
import type { CoverLetterDoc } from '@/types/coverLetter.types'
import { Search } from 'lucide-react'

export default function CLSavedList() {
  const { items, select } = useCoverLetterStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const t = q.toLowerCase()
    return items.filter((d) => {
      const blob = `${d.meta.name} ${d.variables?.Company ?? ''} ${d.variables?.Role ?? ''}`.toLowerCase()
      return blob.includes(t)
    })
  }, [q, items])

  const handleOpen = (d: CoverLetterDoc) => {
    select(d.meta.id)
    setOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search cover letters…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {filtered.map((d) => (
          <CLSavedRow key={d.meta.id} d={d} onOpen={handleOpen} />
        ))}
        {!filtered.length && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No cover letters found.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl grid md:grid-cols-2 gap-4">
          <div>
            <CLEditor />
          </div>
          <div>
            <CLPreview />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
