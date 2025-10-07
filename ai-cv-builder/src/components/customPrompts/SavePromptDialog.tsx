import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Save, X } from 'lucide-react'
import { useCustomPromptsStore } from '@/store/customPrompts.store'

interface SavePromptDialogProps {
  content: string
  trigger?: React.ReactNode
  onSaved?: () => void
}

export function SavePromptDialog({ content, trigger, onSaved }: SavePromptDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [editedContent, setEditedContent] = useState(content)
  const [folderId, setFolderId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const { addPrompt, folders } = useCustomPromptsStore()

  const handleSave = () => {
    if (!name.trim()) return

    addPrompt({
      name: name.trim(),
      content: editedContent.trim(),
      folderId: folderId || undefined,
      tags,
      isDefault,
    })

    // Reset form
    setName('')
    setEditedContent(content)
    setFolderId('')
    setTags([])
    setIsDefault(false)
    setOpen(false)
    onSaved?.()
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Prompt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Custom Prompt</DialogTitle>
          <DialogDescription>
            Save this prompt for reuse in future cover letters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Prompt Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emphasize Leadership Skills"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Prompt Content*</Label>
            <Textarea
              id="content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter your custom instructions..."
            />
          </div>

          {/* Folder */}
          <div>
            <Label htmlFor="folder">Folder (Optional)</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="folder">
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Set as Default */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="default" className="text-sm font-normal cursor-pointer">
              Set as default prompt
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !editedContent.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}