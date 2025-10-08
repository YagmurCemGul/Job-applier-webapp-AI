import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSettings, DEFAULT_SETTINGS } from '@/types/settings.types'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase.config'

interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  
  loadSettings: (userId: string) => Promise<void>
  updateSettings: (userId: string, updates: Partial<UserSettings>) => Promise<void>
  resetSettings: (userId: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loading: false,

      loadSettings: async (userId: string) => {
        set({ loading: true })
        try {
          const settingsRef = doc(db, 'settings', userId)
          const settingsDoc = await getDoc(settingsRef)

          if (settingsDoc.exists()) {
            set({
              settings: {
                ...settingsDoc.data(),
                userId,
                updatedAt: settingsDoc.data().updatedAt?.toDate() || new Date(),
              } as UserSettings,
              loading: false,
            })
          } else {
            // Create default settings
            const defaultSettings: UserSettings = {
              ...DEFAULT_SETTINGS,
              userId,
              updatedAt: new Date(),
            }
            await setDoc(settingsRef, defaultSettings)
            set({ settings: defaultSettings, loading: false })
          }
        } catch (error) {
          console.error('Error loading settings:', error)
          set({ loading: false })
        }
      },

      updateSettings: async (userId: string, updates: Partial<UserSettings>) => {
        set({ loading: true })
        try {
          const settingsRef = doc(db, 'settings', userId)
          const updatedSettings = {
            ...get().settings,
            ...updates,
            userId,
            updatedAt: new Date(),
          }

          await setDoc(settingsRef, updatedSettings, { merge: true })
          set({ settings: updatedSettings as UserSettings, loading: false })
        } catch (error) {
          console.error('Error updating settings:', error)
          set({ loading: false })
          throw error
        }
      },

      resetSettings: async (userId: string) => {
        set({ loading: true })
        try {
          const settingsRef = doc(db, 'settings', userId)
          const defaultSettings: UserSettings = {
            ...DEFAULT_SETTINGS,
            userId,
            updatedAt: new Date(),
          }
          await setDoc(settingsRef, defaultSettings)
          set({ settings: defaultSettings, loading: false })
        } catch (error) {
          console.error('Error resetting settings:', error)
          set({ loading: false })
          throw error
        }
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)
