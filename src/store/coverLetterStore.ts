import { create } from 'zustand'
import { CoverLetter, CoverLetterResult } from '@/types/coverLetter.types'

interface CoverLetterState {
  currentLetter: CoverLetterResult | null
  isGenerating: boolean
  error: string | null
  savedLetters: CoverLetter[]
  setCurrentLetter: (letter: CoverLetterResult) => void
  setGenerating: (isGenerating: boolean) => void
  setError: (error: string | null) => void
  saveLetter: (letter: Omit<CoverLetter, 'id' | 'createdAt' | 'updatedAt'>) => void
  deleteLetter: (id: string) => void
  reset: () => void
}

export const useCoverLetterStore = create<CoverLetterState>((set) => ({
  currentLetter: null,
  isGenerating: false,
  error: null,
  savedLetters: [],

  setCurrentLetter: (letter) => set({ currentLetter: letter }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setError: (error) => set({ error }),

  saveLetter: (letter) => {
    const newLetter: CoverLetter = {
      ...letter,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      savedLetters: [...state.savedLetters, newLetter],
    }))
  },

  deleteLetter: (id) => {
    set((state) => ({
      savedLetters: state.savedLetters.filter((l) => l.id !== id),
    }))
  },

  reset: () =>
    set({
      currentLetter: null,
      isGenerating: false,
      error: null,
    }),
}))
