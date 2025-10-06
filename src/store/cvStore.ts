import { create } from 'zustand'
import { CV } from '@/types'

interface CVState {
  cvs: CV[]
  currentCV: CV | null
  setCurrentCV: (cv: CV | null) => void
  addCV: (cv: CV) => void
  updateCV: (id: string, cv: Partial<CV>) => void
  deleteCV: (id: string) => void
}

export const useCVStore = create<CVState>((set) => ({
  cvs: [],
  currentCV: null,
  setCurrentCV: (cv) => set({ currentCV: cv }),
  addCV: (cv) => set((state) => ({ cvs: [...state.cvs, cv] })),
  updateCV: (id, updates) =>
    set((state) => ({
      cvs: state.cvs.map((cv) => (cv.id === id ? { ...cv, ...updates } : cv)),
    })),
  deleteCV: (id) => set((state) => ({ cvs: state.cvs.filter((cv) => cv.id !== id) })),
}))
