/**
 * Cover Letter Keyword Assist - Step 30
 * Insert missing ATS keywords into cover letter
 */

import { useATSStore } from '@/stores/ats.store'
import { useCoverLetterStore } from '@/stores/coverLetter.store'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export default function CLKeywordAssist() {
  const { result } = useATSStore()
  const { items, activeId, updateContent } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)
  const missing = result?.missingKeywords ?? []

  if (!doc) return null

  const handleInsertKeyword = (keyword: string) => {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return

    const range = sel.getRangeAt(0)
    const node = document.createTextNode(` ${keyword} `)
    range.insertNode(node)
    range.setStartAfter(node)
    range.setEndAfter(node)

    const root = findRootEditable(range.commonAncestorContainer)
    if (root) {
      updateContent(doc.meta.id, (root as HTMLElement).innerHTML, 'keyword-insert')
    }
  }

  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="font-medium">Keyword Assist</div>
      <div className="text-xs text-muted-foreground">
        Click to insert keyword at cursor position in the editor.
      </div>
      <div className="flex flex-wrap gap-2">
        {missing.slice(0, 30).map((k: string) => (
          <Badge
            key={k}
            variant="outline"
            className="cursor-pointer hover:bg-muted"
            onClick={() => handleInsertKeyword(k)}
          >
            <Plus className="h-3 w-3 mr-1" />
            {k}
          </Badge>
        ))}
        {!missing.length && (
          <div className="text-sm text-muted-foreground">
            No missing keywords. Run ATS analysis to see suggestions.
          </div>
        )}
      </div>
    </div>
  )
}

function findRootEditable(node: Node): Node | null {
  let n: Node | null = node
  while (n && n.parentNode) {
    if ((n as HTMLElement).isContentEditable) return n
    n = n.parentNode
  }
  return null
}
