import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { UIStore } from '@/types/store.types'
import i18n from '@/config/i18n'

const initialState = {
  theme: 'system' as const,
  language: 'en' as const,
  sidebarCollapsed: false,
  toasts: [],
  modals: [],
  isLoading: false,
  loadingMessage: null,
}

export const useUIStore = create<UIStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
          // Apply theme to document
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else if (theme === 'light') {
            document.documentElement.classList.remove('dark')
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (prefersDark) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        }),

      setLanguage: (language) =>
        set((state) => {
          state.language = language
          // Update i18next language
          i18n.changeLanguage(language)
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed
        }),

      addToast: (toast) =>
        set((state) => {
          const id = Math.random().toString(36).substring(7)
          state.toasts.push({ ...toast, id })
          
          // Auto-remove toast after duration
          const duration = toast.duration || 5000
          setTimeout(() => {
            set((state) => {
              state.toasts = state.toasts.filter((t) => t.id !== id)
            })
          }, duration)
        }),

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((toast) => toast.id !== id)
        }),

      clearToasts: () =>
        set((state) => {
          state.toasts = []
        }),

      openModal: (modal) =>
        set((state) => {
          const id = Math.random().toString(36).substring(7)
          state.modals.push({ ...modal, id })
        }),

      closeModal: (id) =>
        set((state) => {
          state.modals = state.modals.filter((modal) => modal.id !== id)
        }),

      clearModals: () =>
        set((state) => {
          state.modals = []
        }),

      setGlobalLoading: (loading, message) =>
        set((state) => {
          state.isLoading = loading
          state.loadingMessage = message || null
        }),
    })),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Initialize theme on load
const theme = useUIStore.getState().theme
useUIStore.getState().setTheme(theme)