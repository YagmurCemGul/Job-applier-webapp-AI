import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { ProfileStore, ProfileData } from '@/types/store.types'

const initialState = {
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setProfiles: (profiles: ProfileData[]) =>
        set((state) => {
          state.profiles = profiles
        }),

      addProfile: (profile: ProfileData) =>
        set((state) => {
          state.profiles.push(profile)
        }),

      updateProfile: (id: string, updates: Partial<ProfileData>) =>
        set((state) => {
          const index = state.profiles.findIndex((p) => p.id === id)
          if (index !== -1) {
            state.profiles[index] = { ...state.profiles[index], ...updates }
          }
          if (state.currentProfile?.id === id) {
            state.currentProfile = { ...state.currentProfile, ...updates }
          }
        }),

      deleteProfile: (id: string) =>
        set((state) => {
          state.profiles = state.profiles.filter((p) => p.id !== id)
          if (state.currentProfile?.id === id) {
            state.currentProfile = state.profiles[0] || null
          }
        }),

      setCurrentProfile: (profile: ProfileData | null) =>
        set((state) => {
          state.currentProfile = profile
        }),

      setPrimaryProfile: (id: string) =>
        set((state) => {
          state.profiles = state.profiles.map((p) => ({
            ...p,
            isPrimary: p.id === id,
          }))
        }),

      setLoading: (loading: boolean) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (error: string | null) =>
        set((state) => {
          state.error = error
        }),

      clearProfiles: () =>
        set((state) => {
          state.profiles = []
          state.currentProfile = null
          state.error = null
        }),
    })),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
