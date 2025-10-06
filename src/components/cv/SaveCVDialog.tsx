import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, CheckCircle } from 'lucide-react'
import { useCVDataStore } from '@/store/cvDataStore'
import { useToast } from '@/components/ui/use-toast'

const saveCVSchema = z.object({
  name: z.string().min(1, 'CV name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.string().optional(),
})

type SaveCVFormData = z.infer<typeof saveCVSchema>

interface SaveCVDialogProps {
  trigger?: React.ReactNode
  onSaved?: () => void
}

export function SaveCVDialog({ trigger, onSaved }: SaveCVDialogProps) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const { saveCurrentCV, currentSavedCVId, getSavedCVById } = useCVDataStore()
  const { toast } = useToast()

  const currentCV = currentSavedCVId ? getSavedCVById(currentSavedCVId) : null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaveCVFormData>({
    resolver: zodResolver(saveCVSchema),
    defaultValues: {
      name: currentCV?.name || '',
      description: currentCV?.description || '',
      tags: currentCV?.tags.join(', ') || '',
    },
  })

  const onSubmit = async (data: SaveCVFormData) => {
    try {
      saveCurrentCV(data.name, data.description)

      setSaved(true)
      toast({
        title: 'CV Saved Successfully',
        description: `"${data.name}" has been saved.`,
      })

      setTimeout(() => {
        setOpen(false)
        setSaved(false)
        reset()
        onSaved?.()
      }, 1500)
    } catch (error) {
      toast({
        title: 'Error Saving CV',
        description: error instanceof Error ? error.message : 'Failed to save CV',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setSaved(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save CV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{currentSavedCVId ? 'Update CV' : 'Save CV'}</DialogTitle>
          <DialogDescription>
            {currentSavedCVId
              ? 'Update your saved CV with the latest changes'
              : 'Save your CV so you can access it later'}
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
            <p className="text-lg font-semibold">CV Saved Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">CV Name*</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Software Engineer - Google"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this CV version..."
                rows={3}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="e.g., tech, remote, senior (comma-separated)"
              />
              <p className="mt-1 text-xs text-gray-500">Add tags to organize your CVs</p>
            </div>

            {currentCV && (
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <Badge variant="secondary">v{currentCV.version}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Modified:</span>
                  <span className="text-gray-800">
                    {new Date(currentCV.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {currentSavedCVId ? 'Update' : 'Save'} CV
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
