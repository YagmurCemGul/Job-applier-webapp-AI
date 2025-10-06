import type { CoverLetterDoc } from '@/types/coverletter.types'
import { Button } from '@/components/ui/button'
import { Star, Copy, FileDown, Trash2 } from 'lucide-react'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { exportCoverLetter } from '@/services/coverletter/clExport.service'

export default function CLSavedRow({
  d,
  onOpen,
}: {
  d: CoverLetterDoc
  onOpen: (d: CoverLetterDoc) => void
}) {
  const { toggleFavorite, remove, duplicate } = useCoverLetterStore()

  return (
    <div className="flex items-center justify-between rounded-md border bg-background p-3 transition-colors hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 truncate font-medium">
          {d.meta.name}
          <span className="text-muted-foreground">• {d.variables?.Company ?? '—'}</span>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {d.variables?.Role ?? '—'} • {new Date(d.meta.updatedAt).toLocaleString()}
        </div>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Favorite"
          onClick={() => toggleFavorite(d.meta.id)}
        >
          <Star className={d.meta.favorite ? 'fill-current text-yellow-500' : ''} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onOpen(d)}>
          Open
        </Button>
        <Button variant="outline" size="sm" onClick={() => duplicate(d.meta.id)}>
          <Copy className="mr-1 h-4 w-4" />
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportCoverLetter(d, 'pdf')}>
          <FileDown className="mr-1 h-4 w-4" />
          PDF
        </Button>
        <Button variant="destructive" size="sm" onClick={() => remove(d.meta.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
