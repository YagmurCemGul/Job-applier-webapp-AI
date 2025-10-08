/**
 * Cover Letter Saved Row - Step 30
 * Individual row in saved cover letters list
 */

import type { CoverLetterDoc } from '@/types/coverLetter.types'
import { Button } from '@/components/ui/button'
import { Star, Copy, Trash2, FileText } from 'lucide-react'
import { useCoverLetterStore } from '@/stores/coverLetter.store'
import { exportCoverLetter } from '@/services/coverletter/clExport.service'

interface Props {
  d: CoverLetterDoc
  onOpen: (d: CoverLetterDoc) => void
}

export default function CLSavedRow({ d, onOpen }: Props) {
  const { toggleFavorite, remove, duplicate } = useCoverLetterStore()

  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-background">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate flex items-center gap-2">
          {d.meta.name}
          <span className="text-muted-foreground">
            • {d.variables?.Company ?? '—'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {d.variables?.Role ?? '—'} •{' '}
          {new Date(d.meta.updatedAt).toLocaleString()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Favorite"
          onClick={() => toggleFavorite(d.meta.id)}
        >
          <Star
            className={`h-4 w-4 ${d.meta.favorite ? 'fill-current text-yellow-500' : ''}`}
          />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onOpen(d)}>
          Open
        </Button>
        <Button variant="outline" size="sm" onClick={() => duplicate(d.meta.id)}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCoverLetter(d, 'pdf')}
        >
          <FileText className="h-4 w-4 mr-1" />
          PDF
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => remove(d.meta.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
