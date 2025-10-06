import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PromptFolder, SavedPrompt } from '@/types/prompts.types'

interface PromptState {
  folders: PromptFolder[]
  prompts: SavedPrompt[]
  upsertFolder: (name: string, id?: string) => string
  deleteFolder: (id: string) => void
  upsertPrompt: (p: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string
  deletePrompt: (id: string) => void
  listByFolder: (folderId?: string) => SavedPrompt[]
}

function rid(prefix = 'p'): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}_${Math.random().toString(36).slice(2)}`
}

export const usePromptLibraryStore = create<PromptState>()(
  persist(
    (set, get) => ({
      folders: [],
      prompts: [],

      upsertFolder: (name, id) => {
        const fid = id ?? rid('f')
        const now = new Date()
        const doc: PromptFolder = { id: fid, name, createdAt: now, updatedAt: now }
        set({ folders: [doc, ...get().folders.filter((f) => f.id !== fid)] })
        return fid
      },

      deleteFolder: (id) => {
        set({
          folders: get().folders.filter((f) => f.id !== id),
          prompts: get().prompts.map((p) =>
            p.folderId === id ? { ...p, folderId: undefined } : p
          ),
        })
      },

      upsertPrompt: (p) => {
        const id = p.id ?? rid('pr')
        const now = new Date()
        const doc: SavedPrompt = {
          id,
          name: p.name,
          folderId: p.folderId,
          body: p.body,
          createdAt: now,
          updatedAt: now,
        }
        set({ prompts: [doc, ...get().prompts.filter((x) => x.id !== id)] })
        return id
      },

      deletePrompt: (id) => set({ prompts: get().prompts.filter((p) => p.id !== id) }),

      listByFolder: (folderId) =>
        get().prompts.filter((p) => p.folderId === folderId || (!folderId && !p.folderId)),
    }),
    { name: 'prompt-library', storage: createJSONStorage(() => localStorage), version: 1 }
  )
)
