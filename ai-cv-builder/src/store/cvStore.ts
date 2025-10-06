import { create } from 'zustand'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CVState {
  // CV store will be implemented in later steps
}

export const useCVStore = create<CVState>(() => ({}))
