import { useATSStore } from '@/store/atsStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CLKeywordAssist() {
  const { result } = useATSStore()
  const { items, activeId, updateContent } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)
  const missing = result?.missingKeywords ?? []

  if (!doc) return null

  const insertAtCursor = (text: string) => {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const range = sel.getRangeAt(0)
    const node = document.createTextNode(` ${text} `)
    range.insertNode(node)
    range.setStartAfter(node)
    range.setEndAfter(node)
    const root = findRootEditable(range.commonAncestorContainer)
    if (root) updateContent(doc.meta.id, (root as HTMLElement).innerHTML, 'keyword-insert')
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="font-medium">Keyword Assist</div>
      <div className="text-xs text-muted-foreground">
        Click to insert missing ATS keywords at cursor position.
      </div>
      <div className="flex flex-wrap gap-2">
        {missing.slice(0, 30).map((k: string) => (
          <Button
            key={k}
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => insertAtCursor(k)}
          >
            <Plus className="mr-1 h-3 w-3" />
            {k}
          </Button>
        ))}
        {missing.length === 0 && (
          <div className="text-sm text-muted-foreground">No missing keywords. Great job!</div>
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
