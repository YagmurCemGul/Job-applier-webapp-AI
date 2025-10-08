import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useExportPresetsStore } from '@/stores/exportPresets.store'
import { batchExport } from '@/services/variants/batchExport.service'
import { useVariantsStore } from '@/stores/variants.store'
import type { ExportFormat } from '@/types/export.types'

interface ExportPresetDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

/**
 * Dialog for managing export presets and exporting
 */
export default function ExportPresetDialog({ open, onOpenChange }: ExportPresetDialogProps) {
  const { presets, upsert } = useExportPresetsStore()
  const { activeId } = useVariantsStore()
  const [name, setName] = useState('Default')
  const [tpl, setTpl] = useState('CV_{FirstName}_{LastName}_{Role}_{Company}_{Date}_{VariantName}')
  const [pdf, setPdf] = useState(true)
  const [docx, setDocx] = useState(false)
  const [gdoc, setGdoc] = useState(false)
  const [locale, setLocale] = useState<'en' | 'tr'>('en')

  const savePreset = () => {
    const formats: ExportFormat[] = [
      pdf && 'pdf',
      docx && 'docx',
      gdoc && 'gdoc',
    ].filter(Boolean) as ExportFormat[]
    
    const id = upsert({
      name,
      namingTemplate: tpl,
      formats,
      locale,
      includeCoverLetter: false,
    })
    
    return id
  }

  const handleSaveAndExport = async () => {
    const id = savePreset()
    
    if (activeId) {
      const p = presets.find((x) => x.id === id)
      
      if (!p) {
        // Preset was just created, construct it
        const formats: ExportFormat[] = [
          pdf && 'pdf',
          docx && 'docx',
          gdoc && 'gdoc',
        ].filter(Boolean) as ExportFormat[]
        
        const newPreset = {
          id,
          name,
          namingTemplate: tpl,
          formats,
          locale,
          includeCoverLetter: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        await batchExport(activeId, newPreset)
      } else {
        await batchExport(activeId, p)
      }
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Export Presets</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Preset name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Naming template"
          value={tpl}
          onChange={(e) => setTpl(e.target.value)}
        />
        <div className="flex gap-3 items-center text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pdf}
              onChange={(e) => setPdf(e.target.checked)}
            />
            PDF
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={docx}
              onChange={(e) => setDocx(e.target.checked)}
            />
            DOCX
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={gdoc}
              onChange={(e) => setGdoc(e.target.checked)}
            />
            Google Doc
          </label>
          <select
            className="border rounded-md p-1 ml-auto"
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en' | 'tr')}
          >
            <option value="en">EN</option>
            <option value="tr">TR</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSaveAndExport}>Save & Export</Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Tokens: {'{FirstName} {MiddleName} {LastName} {Role} {Company} {Date} {JobId} {VariantName} {Locale}'}
        </div>
      </DialogContent>
    </Dialog>
  )
}
