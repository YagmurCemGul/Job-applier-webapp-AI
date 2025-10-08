/**
 * Cover Letter Prompt Library Dialog - Step 30
 * Manage and reuse prompts
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePromptLibrary } from '@/stores/promptLibrary.store'
import { useState } from 'react'
import { Folder, FolderPlus, Copy, Trash2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function CLPromptLibraryDialog({ open, onOpenChange }: Props) {
  const lib = usePromptLibrary()
  const [folderName, setFolderName] = useState('')
  const [promptName, setPromptName] = useState('')
  const [promptBody, setPromptBody] = useState('')
  const [selFolder, setSelFolder] = useState<string>('')

  const handleAddFolder = () => {
    if (!folderName.trim()) return
    const id = lib.upsertFolder(folderName.trim())
    setSelFolder(id)
    setFolderName('')
  }

  const handleSavePrompt = () => {
    if (!promptName.trim() || !promptBody.trim()) return
    lib.upsertPrompt({
      name: promptName.trim(),
      folderId: selFolder || undefined,
      body: promptBody.trim(),
    })
    setPromptName('')
    setPromptBody('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3 max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prompt Library</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="New folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <Button onClick={handleAddFolder}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Add Folder
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Folders
            </div>
            <Select value={selFolder} onValueChange={setSelFolder}>
              <SelectTrigger>
                <SelectValue placeholder="(No folder)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">(No folder)</SelectItem>
                {lib.folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <div className="text-sm font-medium">Prompts</div>
              <div className="border rounded-md divide-y max-h-48 overflow-auto">
                {lib.listByFolder(selFolder).map((p) => (
                  <div key={p.id} className="p-2 flex items-center justify-between">
                    <div className="text-sm truncate flex-1">{p.name}</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(p.body)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => lib.deletePrompt(p.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {!lib.listByFolder(selFolder).length && (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No prompts in this folder
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Prompt name"
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
            />
            <Textarea
              rows={6}
              placeholder="Prompt body…"
              value={promptBody}
              onChange={(e) => setPromptBody(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setPromptName('')
                  setPromptBody('')
                }}
              >
                Clear
              </Button>
              <Button onClick={handleSavePrompt}>Save Prompt</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
