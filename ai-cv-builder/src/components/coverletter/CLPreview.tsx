/**
 * Cover Letter Preview - Step 30
 * Live HTML preview of the cover letter
 */

import { useCoverLetterStore } from '@/stores/coverLetter.store'

export default function CLPreview() {
  const { items, activeId } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)

  if (!doc) return null

  return (
    <div className="border rounded-md p-4 bg-background">
      <div className="text-sm text-muted-foreground mb-2">Preview</div>
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: doc.content }}
      />
    </div>
  )
}
