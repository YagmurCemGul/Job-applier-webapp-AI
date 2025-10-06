import { create } from 'zustand'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UserState {
  // User store will be implemented in later steps
}

export const useUserStore = create<UserState>(() => ({}))
