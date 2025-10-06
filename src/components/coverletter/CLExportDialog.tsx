import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { exportCoverLetter } from '@/services/coverletter/clExport.service'
import { useState } from 'react'
import type { ExportFormat } from '@/types/export.types'

export default function CLExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { items, activeId } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)
  const [pdf, setPdf] = useState(true)
  const [docx, setDocx] = useState(false)
  const [gdoc, setGdoc] = useState(false)

  if (!doc) return null

  const handleExport = async () => {
    const formats: ExportFormat[] = []
    if (pdf) formats.push('pdf')
    if (docx) formats.push('docx')
    if (gdoc) formats.push('gdoc')

    for (const fmt of formats) {
      await exportCoverLetter(doc, fmt)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Export Cover Letter</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="fmt-pdf" checked={pdf} onCheckedChange={(c) => setPdf(!!c)} />
            <Label htmlFor="fmt-pdf" className="cursor-pointer">
              PDF
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="fmt-docx" checked={docx} onCheckedChange={(c) => setDocx(!!c)} />
            <Label htmlFor="fmt-docx" className="cursor-pointer">
              DOCX
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="fmt-gdoc" checked={gdoc} onCheckedChange={(c) => setGdoc(!!c)} />
            <Label htmlFor="fmt-gdoc" className="cursor-pointer">
              Google Doc
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleExport} disabled={!pdf && !docx && !gdoc}>
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
