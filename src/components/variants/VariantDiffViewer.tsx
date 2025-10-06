import { useVariantsStore } from '@/store/variantsStore'
import type { DiffBlock } from '@/types/variants.types'
import { useTranslation } from 'react-i18next'

export default function VariantDiffViewer() {
  const { t } = useTranslation()
  const { activeId, diffAgainstBase } = useVariantsStore()

  if (!activeId) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {t('variants.selectToView')}
      </div>
    )
  }

  const diff = diffAgainstBase(activeId)
  if (!diff) return null

  return (
    <div className="space-y-4">
      <DiffBlockComponent title={t('variants.diff.summary')} block={diff.summary} />
      <DiffBlockComponent title={t('variants.diff.skills')} block={diff.skills} />
      <SectionArray title={t('variants.diff.experience')} blocks={diff.experience} />
      <SectionArray title={t('variants.diff.education')} blocks={diff.education} />
      <DiffBlockComponent title={t('variants.diff.contact')} block={diff.contact} />
    </div>
  )
}

function DiffBlockComponent({ title, block }: { title: string; block?: DiffBlock }) {
  const { t } = useTranslation()
  if (!block) return null

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-2 font-semibold">
        {title}
        <ChangeIndicator change={block.change} />
      </div>
      <div className="grid md:grid-cols-2">
        <Pre title={t('variants.before')} text={block.before} />
        <Pre title={t('variants.after')} text={block.after} />
      </div>
      {block.inline && block.inline.length > 0 && <InlineDiff inline={block.inline} />}
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
    <div className="border-r p-3 last:border-r-0">
      <div className="mb-1 text-xs text-muted-foreground">{title}</div>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{text || '—'}</pre>
    </div>
  )
}

function InlineDiff({ inline }: { inline: Array<{ text: string; change: string }> }) {
  return (
    <div className="border-t p-3 text-sm">
      {inline.map((seg, i) => (
        <span
          key={i}
          className={
            seg.change === 'added'
              ? 'bg-green-100 dark:bg-green-900/30'
              : seg.change === 'removed'
                ? 'bg-red-100 line-through dark:bg-red-900/30'
                : ''
          }
        >
          {seg.text}
        </span>
      ))}
    </div>
  )
}

function ChangeIndicator({ change }: { change: string }) {
  const colors = {
    added: 'text-green-600 dark:text-green-400',
    removed: 'text-red-600 dark:text-red-400',
    modified: 'text-orange-600 dark:text-orange-400',
    unchanged: 'text-muted-foreground',
  }

  return (
    <span className={`text-xs font-normal ${colors[change as keyof typeof colors]}`}>{change}</span>
  )
}
