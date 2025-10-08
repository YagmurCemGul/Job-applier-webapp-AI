/**
 * Cover Letter Export Dialog - Step 30
 * Export cover letter to PDF/DOCX/Google Doc
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCoverLetterStore } from '@/stores/coverLetter.store'
import { exportCoverLetter } from '@/services/coverletter/clExport.service'
import { useState } from 'react'
import { FileText, FileSpreadsheet, FileCode } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function CLExportDialog({ open, onOpenChange }: Props) {
  const { items, activeId } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)
  const [pdf, setPdf] = useState(true)
  const [docx, setDocx] = useState(false)
  const [gdoc, setGdoc] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (!doc) return null

  const handleExport = async () => {
    setExporting(true)
    try {
      if (pdf) await exportCoverLetter(doc, 'pdf')
      if (docx) await exportCoverLetter(doc, 'docx')
      if (gdoc) await exportCoverLetter(doc, 'gdoc')
      onOpenChange(false)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Export Cover Letter</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="pdf" checked={pdf} onCheckedChange={(c) => setPdf(!!c)} />
            <Label htmlFor="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="docx"
              checked={docx}
              onCheckedChange={(c) => setDocx(!!c)}
            />
            <Label htmlFor="docx" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              DOCX
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gdoc"
              checked={gdoc}
              onCheckedChange={(c) => setGdoc(!!c)}
            />
            <Label htmlFor="gdoc" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Google Doc
            </Label>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || (!pdf && !docx && !gdoc)}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
