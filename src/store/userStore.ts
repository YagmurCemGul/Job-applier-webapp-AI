import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { UserStore } from '@/types/store.types'
import { User } from '@/types/user.types'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const useUserStore = create<UserStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setUser: (user: User) =>
        set((state) => {
          state.user = user
          state.isAuthenticated = true
          state.error = null
        }),

      updateUser: (updates: Partial<User>) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updates }
          }
        }),

      clearUser: () =>
        set((state) => {
          state.user = null
          state.isAuthenticated = false
          state.error = null
        }),

      setLoading: (loading: boolean) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (error: string | null) =>
        set((state) => {
          state.error = error
        }),
    })),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
