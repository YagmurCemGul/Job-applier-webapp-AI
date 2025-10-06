import { useRef } from 'react'
import { useATSStore } from '@/store/atsStore'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

/**
 * Job file tab - upload job description file
 */
export default function JobFileTab() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { setJobText, parseJob, isParsing } = useATSStore()

  const onPick = () => inputRef.current?.click()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    try {
      const text = await f.text()
      setJobText(text)
    } catch (error) {
      console.error('Failed to read file:', error)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.html"
        className="hidden"
        onChange={onChange}
        aria-label="Upload job file"
      />
      <Button variant="outline" onClick={onPick} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Choose File
      </Button>
      <Button onClick={parseJob} disabled={isParsing} className="w-full">
        {isParsing ? 'Parsing...' : 'Parse'}
      </Button>
    </div>
  )
}
