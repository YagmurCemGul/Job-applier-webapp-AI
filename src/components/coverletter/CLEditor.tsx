import { useCoverLetterStore } from '@/store/coverLetterStore'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function CLEditor() {
  const { items, activeId, updateContent } = useCoverLetterStore()
  const { toast } = useToast()
  const doc = items.find((x) => x.meta.id === activeId)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !doc) return
    ref.current.innerHTML = doc.content || ''
  }, [doc?.content, activeId])

  if (!doc) {
    return (
      <div className="text-sm text-muted-foreground text-center p-8">
        No cover letter selected. Click Generate to create one.
      </div>
    )
  }

  const copyText = () => {
    const text = doc.content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied to clipboard', description: 'Cover letter text copied successfully' })
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Editor</div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[240px] border rounded-md p-3 prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary"
        onBlur={(e) => updateContent(doc.meta.id, e.currentTarget.innerHTML || '', 'edit')}
        aria-label="Cover letter editor"
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={copyText}>
          <Copy className="h-4 w-4 mr-2" />
          Copy as Text
        </Button>
      </div>
    </div>
  )
}
