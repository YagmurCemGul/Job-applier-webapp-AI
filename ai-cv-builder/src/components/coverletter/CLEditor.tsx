/**
 * Cover Letter Editor - Step 30
 * ContentEditable editor with save and copy functionality
 */

import { useCoverLetterStore } from '@/stores/coverLetter.store'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toPlain } from '@/services/coverletter/clVariables.service'

export default function CLEditor() {
  const { items, activeId, updateContent } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !doc) return
    ref.current.innerHTML = doc.content || ''
  }, [doc?.content, activeId])

  if (!doc) {
    return (
      <div className="text-sm text-muted-foreground">
        No cover letter selected. Click Generate to create one.
      </div>
    )
  }

  const handleCopyAsText = () => {
    const text = toPlain(doc.content)
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-2">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[240px] border rounded-md p-3 prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary"
        onBlur={(e) =>
          updateContent(doc.meta.id, e.currentTarget.innerHTML || '', 'edit')
        }
        aria-label="Cover letter editor"
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopyAsText}>
          <Copy className="mr-2 h-4 w-4" />
          Copy as Text
        </Button>
      </div>
    </div>
  )
}
