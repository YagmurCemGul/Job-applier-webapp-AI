import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Star, Trash2, Copy, MoreVertical, FolderOpen } from 'lucide-react'
import { useCustomPromptsStore } from '@/store/customPromptsStore'
import { FOLDER_COLORS, PROMPT_TEMPLATES } from '@/types/customPrompt.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface PromptsLibraryProps {
  onSelect: (content: string) => void
}

export function PromptsLibrary({ onSelect }: PromptsLibraryProps) {
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { prompts, folders, deletePrompt, setDefaultPrompt, incrementUsage } =
    useCustomPromptsStore()

  const handleUsePrompt = (id: string, content: string) => {
    incrementUsage(id)
    onSelect(content)
  }

  const handleUseTemplate = (content: string) => {
    onSelect(content)
  }

  const handleDelete = (id: string) => {
    deletePrompt(id)
    setDeleteId(null)
  }

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      search === '' ||
      prompt.name.toLowerCase().includes(search.toLowerCase()) ||
      prompt.content.toLowerCase().includes(search.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))

    const matchesFolder =
      selectedFolder === 'all' ||
      (selectedFolder === 'none' && !prompt.folderId) ||
      prompt.folderId === selectedFolder

    return matchesSearch && matchesFolder
  })

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="pl-9"
          />
        </div>

        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            <SelectItem value="none">No Folder</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Section */}
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Star className="h-4 w-4 text-yellow-500" />
          Quick Templates
        </h4>
        <ScrollArea className="h-[150px]">
          <div className="space-y-2">
            {PROMPT_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer p-3 transition-colors hover:bg-gray-50"
                onClick={() => handleUseTemplate(template.content)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{template.name}</div>
                    <p className="mt-1 text-xs text-gray-600">{template.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Saved Prompts */}
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <FolderOpen className="h-4 w-4" />
          My Prompts ({filteredPrompts.length})
        </h4>

        {filteredPrompts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">
              {search ? 'No prompts found' : 'No saved prompts yet'}
            </p>
          </Card>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredPrompts.map((prompt) => {
                const folder = folders.find((f) => f.id === prompt.folderId)
                const folderColor = folder
                  ? FOLDER_COLORS.find((c) => c.value === folder.color)?.class
                  : undefined

                return (
                  <Card key={prompt.id} className="p-3 transition-colors hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleUsePrompt(prompt.id, prompt.content)}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium">{prompt.name}</span>
                          {prompt.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="mr-1 h-3 w-3" />
                              Default
                            </Badge>
                          )}
                          {folder && (
                            <Badge className={`text-xs ${folderColor}`}>{folder.name}</Badge>
                          )}
                        </div>

                        <p className="line-clamp-2 text-xs text-gray-600">{prompt.content}</p>

                        {prompt.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {prompt.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-400">
                          Used {prompt.usageCount} times
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUsePrompt(prompt.id, prompt.content)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Use Prompt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDefaultPrompt(prompt.id)}>
                            <Star className="mr-2 h-4 w-4" />
                            Set as Default
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(prompt.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this custom prompt.
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
    </div>
  )
}
