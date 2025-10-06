import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { usePromptLibraryStore } from '@/store/promptLibraryStore'
import { useState } from 'react'
import { FolderPlus, Plus, Copy, Trash2 } from 'lucide-react'

export default function CLPromptLibraryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const lib = usePromptLibraryStore()
  const [folderName, setFolderName] = useState('')
  const [promptName, setPromptName] = useState('')
  const [promptBody, setPromptBody] = useState('')
  const [selFolder, setSelFolder] = useState<string>('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl space-y-4">
        <DialogHeader>
          <DialogTitle>Prompt Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="New folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!folderName.trim()) return
                const id = lib.upsertFolder(folderName.trim())
                setSelFolder(id)
                setFolderName('')
              }}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Folder
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Folders</Label>
              <select
                className="w-full rounded-md border p-2"
                value={selFolder}
                onChange={(e) => setSelFolder(e.target.value)}
              >
                <option value="">(No folder)</option>
                {lib.folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <div className="space-y-2">
                <Label>Prompts</Label>
                <div className="max-h-48 divide-y overflow-auto rounded-md border">
                  {lib.listByFolder(selFolder).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2">
                      <div className="flex-1 truncate text-sm">{p.name}</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(p.body)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => lib.deletePrompt(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {lib.listByFolder(selFolder).length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No prompts in this folder
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Create New Prompt</Label>
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
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPromptName('')
                    setPromptBody('')
                  }}
                >
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    if (!promptName.trim() || !promptBody.trim()) return
                    lib.upsertPrompt({
                      name: promptName.trim(),
                      folderId: selFolder || undefined,
                      body: promptBody.trim(),
                    })
                    setPromptName('')
                    setPromptBody('')
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Save Prompt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
