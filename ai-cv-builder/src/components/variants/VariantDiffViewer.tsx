import { useVariantsStore } from '@/stores/variants.store'
import type { DiffBlock } from '@/types/variants.types'

/**
 * Side-by-side diff viewer for variants
 */
export default function VariantDiffViewer() {
  const { activeId, diffAgainstBase } = useVariantsStore()
  
  if (!activeId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a variant to view differences.
      </div>
    )
  }
  
  const diff = diffAgainstBase(activeId)
  if (!diff) return null

  return (
    <div className="space-y-4">
      <DiffBlockComponent title="Summary" block={diff.summary} />
      <DiffBlockComponent title="Skills" block={diff.skills} />
      <SectionArray title="Experience" blocks={diff.experience} />
      <SectionArray title="Education" blocks={diff.education} />
      <DiffBlockComponent title="Contact" block={diff.contact} />
    </div>
  )
}

function DiffBlockComponent({ title, block }: { title: string; block?: DiffBlock }) {
  if (!block) return null
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="px-3 py-2 font-semibold bg-muted/50">{title}</div>
      <div className="grid md:grid-cols-2">
        <Pre title="Before" text={block.before} />
        <Pre title="After" text={block.after} />
      </div>
      {block.inline && <InlineDiff inline={block.inline} />}
    </div>
  )
}

function SectionArray({ title, blocks }: { title: string; blocks?: DiffBlock[] }) {
  if (!blocks?.length) return null
  
  return (
    <div className="space-y-3">
      <div className="font-semibold">{title}</div>
      {blocks.map((b, i) => (
        <DiffBlockComponent key={i} title={`${title} #${i + 1}`} block={b} />
      ))}
    </div>
  )
}

function Pre({ title, text }: { title: string; text?: string }) {
  return (
    <div className="p-3">
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <pre className="text-sm whitespace-pre-wrap leading-relaxed">{text || '—'}</pre>
    </div>
  )
}

function InlineDiff({ inline }: { inline: Array<{ text: string; change: string }> }) {
  return (
    <div className="p-3 border-t text-sm">
      {inline.map((seg, i) => (
        <span
          key={i}
          className={
            seg.change === 'added'
              ? 'bg-green-100 dark:bg-green-900/30'
              : seg.change === 'removed'
              ? 'bg-red-100 dark:bg-red-900/30 line-through'
              : ''
          }
        >
          {seg.text}
        </span>
      ))}
    </div>
  )
}
