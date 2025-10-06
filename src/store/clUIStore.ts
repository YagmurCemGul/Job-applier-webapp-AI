import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CLTone, CLLength, CLLang } from '@/types/coverletter.types'

interface CLUIState {
  tone: CLTone
  length: CLLength
  lang: CLLang
  templateId: string
  showPreview: boolean
  kwAssistOpen: boolean

  setTone: (t: CLTone) => void
  setLength: (l: CLLength) => void
  setLang: (l: CLLang) => void
  setTemplate: (id: string) => void
  togglePreview: () => void
  toggleKwAssist: () => void
}

export const useCLUIStore = create<CLUIState>()(
  persist(
    (set, get) => ({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      showPreview: true,
      kwAssistOpen: true,

      setTone: (t) => set({ tone: t }),
      setLength: (l) => set({ length: l }),
      setLang: (l) => set({ lang: l }),
      setTemplate: (id) => set({ templateId: id }),
      togglePreview: () => set({ showPreview: !get().showPreview }),
      toggleKwAssist: () => set({ kwAssistOpen: !get().kwAssistOpen }),
    }),
    { name: 'cl-ui', storage: createJSONStorage(() => localStorage), version: 1 }
  )
)
