import { create } from 'zustand'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UIState {
  // UI store will be implemented in later steps
}

export const useUIStore = create<UIState>(() => ({}))
