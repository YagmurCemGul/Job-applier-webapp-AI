import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FileText,
  MoreVertical,
  Edit2,
  Copy,
  Download,
  Trash2,
  Star,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { SavedCV } from '@/types/savedCV.types'
import { format } from 'date-fns'

interface CVCardProps {
  cv: SavedCV
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onSetPrimary: (id: string) => void
  onDownload: (id: string) => void
}

export function CVCard({
  cv,
  onEdit,
  onDuplicate,
  onDelete,
  onSetPrimary,
  onDownload,
}: CVCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    onDelete(cv.id)
    setDeleteDialogOpen(false)
  }

  const getAtsScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <>
      <Card className="group cursor-pointer p-6 transition-shadow hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                {cv.name}
              </h3>
              {cv.isPrimary && (
                <Badge variant="default" className="gap-1">
                  <Star className="h-3 w-3" />
                  Primary
                </Badge>
              )}
            </div>

            {cv.description && (
              <p className="mb-2 line-clamp-2 text-sm text-gray-600">{cv.description}</p>
            )}

            {cv.jobTitle && (
              <p className="text-sm text-gray-500">
                {cv.jobTitle}
                {cv.company && ` at ${cv.company}`}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(cv.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(cv.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(cv.id)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {!cv.isPrimary && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSetPrimary(cv.id)}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as Primary
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {cv.atsScore !== undefined && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">ATS Score</div>
                <Badge className={getAtsScoreColor(cv.atsScore)}>{cv.atsScore}</Badge>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Version</div>
              <div className="text-sm font-medium">v{cv.version}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Modified</div>
              <div className="text-sm font-medium">{format(cv.lastModified, 'MMM dd')}</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {cv.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cv.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onEdit(cv.id)} className="flex-1">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="default" size="sm" onClick={() => onDownload(cv.id)} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CV?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{cv.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
