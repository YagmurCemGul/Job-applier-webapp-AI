import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { CVStore } from '@/types/store.types'
import { CV } from '@/types/cv.types'

const initialState = {
  cvs: [],
  currentCV: null,
  isEditing: false,
  isSaving: false,
  lastSaved: null,
  error: null,
}

export const useCVStore = create<CVStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setCVs: (cvs: CV[]) =>
        set((state) => {
          state.cvs = cvs
        }),

      addCV: (cv: CV) =>
        set((state) => {
          state.cvs.push(cv)
        }),

      updateCV: (id: string, updates: Partial<CV>) =>
        set((state) => {
          const index = state.cvs.findIndex((cv) => cv.id === id)
          if (index !== -1) {
            state.cvs[index] = { ...state.cvs[index], ...updates }
          }
          if (state.currentCV && state.currentCV.id === id) {
            state.currentCV = { ...state.currentCV, ...updates }
          }
        }),

      deleteCV: (id: string) =>
        set((state) => {
          state.cvs = state.cvs.filter((cv) => cv.id !== id)
          if (state.currentCV?.id === id) {
            state.currentCV = null
          }
        }),

      setCurrentCV: (cv: CV | null) =>
        set((state) => {
          state.currentCV = cv
        }),

      setEditing: (editing: boolean) =>
        set((state) => {
          state.isEditing = editing
        }),

      setSaving: (saving: boolean) =>
        set((state) => {
          state.isSaving = saving
        }),

      setLastSaved: (date: Date) =>
        set((state) => {
          state.lastSaved = date
        }),

      setError: (error: string | null) =>
        set((state) => {
          state.error = error
        }),

      clearCVs: () =>
        set((state) => {
          state.cvs = []
          state.currentCV = null
          state.error = null
        }),
    })),
    {
      name: 'cv-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cvs: state.cvs,
        currentCV: state.currentCV,
        lastSaved: state.lastSaved,
      }),
    }
  )
)
