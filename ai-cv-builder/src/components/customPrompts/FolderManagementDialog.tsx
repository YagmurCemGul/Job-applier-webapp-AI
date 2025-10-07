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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FolderPlus, Trash2, Edit2 } from 'lucide-react'
import { useCustomPromptsStore } from '@/store/customPrompts.store'
import { FOLDER_COLORS } from '@/types/customPrompt.types'
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

export function FolderManagementDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('blue')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { folders, addFolder, updateFolder, deleteFolder, getPromptsByFolder } =
    useCustomPromptsStore()

  const handleSave = () => {
    if (!name.trim()) return

    if (editingId) {
      updateFolder(editingId, { name: name.trim(), color })
      setEditingId(null)
    } else {
      addFolder({ name: name.trim(), color })
    }

    setName('')
    setColor('blue')
  }

  const handleEdit = (id: string) => {
    const folder = folders.find((f) => f.id === id)
    if (folder) {
      setName(folder.name)
      setColor(folder.color || 'blue')
      setEditingId(id)
    }
  }

  const handleDelete = (id: string) => {
    deleteFolder(id)
    setDeleteId(null)
  }

  const handleCancel = () => {
    setName('')
    setColor('blue')
    setEditingId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            Manage Folders
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Folders</DialogTitle>
            <DialogDescription>
              Organize your custom prompts into folders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create/Edit Folder */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">
                {editingId ? 'Edit Folder' : 'Create New Folder'}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Tech Jobs"
                  />
                </div>

                <div>
                  <Label htmlFor="folderColor">Color</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger id="folderColor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLDER_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${c.class}`} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!name.trim()}>
                  {editingId ? 'Update' : 'Create'} Folder
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Existing Folders */}
            <div>
              <h4 className="font-medium mb-3">Existing Folders</h4>
              {folders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No folders yet. Create your first folder above.
                </p>
              ) : (
                <div className="space-y-2">
                  {folders.map((folder) => {
                    const colorClass =
                      FOLDER_COLORS.find((c) => c.value === folder.color)?.class ||
                      'bg-gray-100 text-gray-800'
                    const promptCount = getPromptsByFolder(folder.id).length

                    return (
                      <div
                        key={folder.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={colorClass}>{folder.name}</Badge>
                          <span className="text-sm text-gray-500">
                            {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(folder.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(folder.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the folder. Prompts in this folder will not be deleted, but will
              be moved to "No Folder".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}