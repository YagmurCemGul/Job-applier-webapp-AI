import { useRef, useState } from 'react'
import { useATSStore } from '@/stores/ats.store'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'

/**
 * Tab for uploading job posting file
 */
export default function JobFileTab() {
  const { t } = useTranslation('cv')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string>()
  const { setJobText, parseJob, isParsing } = useATSStore()

  const onPick = () => inputRef.current?.click()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    setJobText(text)
    setFileName(f.name)
  }

  return (
    <div className="space-y-3 pt-4">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.html,.pdf,.docx"
        className="hidden"
        onChange={onChange}
        aria-label="Upload job file"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onPick} className="gap-2">
          <Upload className="h-4 w-4" />
          {t('job.chooseFile', 'Choose File')}
        </Button>
        {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
      </div>

      <Button onClick={parseJob} disabled={isParsing} size="sm">
        {isParsing ? t('job.parsing', 'Parsing...') : t('job.parse', 'Parse')}
      </Button>
    </div>
  )
}
