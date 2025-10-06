export interface PromptFolder {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface SavedPrompt {
  id: string
  name: string
  folderId?: string
  body: string
  createdAt: Date
  updatedAt: Date
}
