import { useCoverLetterStore } from '@/store/coverLetterStore'

export default function CLPreview() {
  const { items, activeId } = useCoverLetterStore()
  const doc = items.find((x) => x.meta.id === activeId)

  if (!doc) return null

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Preview</div>
      <div className="border rounded-md p-4 bg-background min-h-[240px]">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: doc.content }} />
      </div>
    </div>
  )
}
