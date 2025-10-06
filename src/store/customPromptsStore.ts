import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CustomPrompt, PromptFolder } from '@/types/customPrompt.types'

interface CustomPromptsState {
  prompts: CustomPrompt[]
  folders: PromptFolder[]
  selectedPromptId: string | null

  // Prompts
  addPrompt: (prompt: Omit<CustomPrompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void
  updatePrompt: (id: string, updates: Partial<CustomPrompt>) => void
  deletePrompt: (id: string) => void
  incrementUsage: (id: string) => void
  setDefaultPrompt: (id: string) => void
  selectPrompt: (id: string | null) => void

  // Folders
  addFolder: (folder: Omit<PromptFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateFolder: (id: string, updates: Partial<PromptFolder>) => void
  deleteFolder: (id: string) => void

  // Getters
  getPromptById: (id: string) => CustomPrompt | undefined
  getPromptsByFolder: (folderId?: string) => CustomPrompt[]
  getDefaultPrompt: () => CustomPrompt | undefined
}

export const useCustomPromptsStore = create<CustomPromptsState>()(
  persist(
    (set, get) => ({
      prompts: [],
      folders: [],
      selectedPromptId: null,

      // Prompts
      addPrompt: (promptData) => {
        const newPrompt: CustomPrompt = {
          ...promptData,
          id: crypto.randomUUID(),
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({ prompts: [...state.prompts, newPrompt] }))
      },

      updatePrompt: (id, updates) => {
        set((state) => ({
          prompts: state.prompts.map((prompt) =>
            prompt.id === id ? { ...prompt, ...updates, updatedAt: new Date() } : prompt
          ),
        }))
      },

      deletePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter((prompt) => prompt.id !== id),
          selectedPromptId: state.selectedPromptId === id ? null : state.selectedPromptId,
        }))
      },

      incrementUsage: (id) => {
        set((state) => ({
          prompts: state.prompts.map((prompt) =>
            prompt.id === id
              ? { ...prompt, usageCount: prompt.usageCount + 1, updatedAt: new Date() }
              : prompt
          ),
        }))
      },

      setDefaultPrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.map((prompt) => ({
            ...prompt,
            isDefault: prompt.id === id,
          })),
        }))
      },

      selectPrompt: (id) => {
        set({ selectedPromptId: id })
      },

      // Folders
      addFolder: (folderData) => {
        const newFolder: PromptFolder = {
          ...folderData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({ folders: [...state.folders, newFolder] }))
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates, updatedAt: new Date() } : folder
          ),
        }))
      },

      deleteFolder: (id) => {
        // Also remove folder from all prompts
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          prompts: state.prompts.map((prompt) =>
            prompt.folderId === id ? { ...prompt, folderId: undefined } : prompt
          ),
        }))
      },

      // Getters
      getPromptById: (id) => {
        return get().prompts.find((prompt) => prompt.id === id)
      },

      getPromptsByFolder: (folderId) => {
        const prompts = get().prompts
        if (folderId === undefined) {
          return prompts.filter((prompt) => !prompt.folderId)
        }
        return prompts.filter((prompt) => prompt.folderId === folderId)
      },

      getDefaultPrompt: () => {
        return get().prompts.find((prompt) => prompt.isDefault)
      },
    }),
    {
      name: 'custom-prompts-storage',
    }
  )
)
