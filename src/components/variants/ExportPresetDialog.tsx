import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useExportPresetsStore } from '@/store/exportPresetsStore'
import { batchExport } from '@/services/variants/batchExport.service'
import { useVariantsStore } from '@/store/variantsStore'
import { useTranslation } from 'react-i18next'
import type { ExportFormat } from '@/types/export.types'

export default function ExportPresetDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { t } = useTranslation()
  const { presets, upsert } = useExportPresetsStore()
  const { activeId } = useVariantsStore()

  const [name, setName] = useState('Default')
  const [tpl, setTpl] = useState('CV_{FirstName}_{LastName}_{Role}_{Company}_{Date}_{VariantName}')
  const [pdf, setPdf] = useState(true)
  const [docx, setDocx] = useState(false)
  const [gdoc, setGdoc] = useState(false)
  const [locale, setLocale] = useState<'en' | 'tr'>('en')

  const savePreset = () => {
    const formats = [pdf && 'pdf', docx && 'docx', gdoc && 'gdoc'].filter(Boolean) as ExportFormat[]
    const id = upsert({ name, namingTemplate: tpl, formats, locale, includeCoverLetter: false })
    return id
  }

  const handleExport = async () => {
    const id = savePreset()
    if (activeId) {
      const p = presets.find((x) => x.id === id)
      if (p) {
        try {
          await batchExport(activeId, p)
        } catch (error) {
          console.error('Export failed:', error)
        }
      }
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl space-y-4">
        <DialogHeader>
          <DialogTitle>{t('variants.exportPresets.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="preset-name">{t('variants.exportPresets.name')}</Label>
            <Input
              id="preset-name"
              placeholder="e.g., Default EN"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="naming-template">{t('variants.exportPresets.template')}</Label>
            <Input
              id="naming-template"
              placeholder="CV_{FirstName}_{LastName}_{Date}"
              value={tpl}
              onChange={(e) => setTpl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
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

            <div className="ml-auto">
              <Select value={locale} onValueChange={(v: 'en' | 'tr') => setLocale(v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="tr">TR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium">{t('variants.exportPresets.tokens')}:</div>
            <div className="font-mono">
              {
                '{FirstName} {MiddleName} {LastName} {Role} {Company} {Date} {JobId} {VariantName} {Locale}'
              }
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleExport} disabled={!activeId}>
            {t('variants.exportPresets.saveExport')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
