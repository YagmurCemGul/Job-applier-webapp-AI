import { create } from 'zustand'
import { Theme, Language } from '@/types'

interface UIState {
  theme: Theme
  language: Language
  sidebarOpen: boolean
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  language: 'en',
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
