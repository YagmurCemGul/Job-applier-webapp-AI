import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CVData, PersonalInfo, Experience, Education, Skill, Project } from '@/types/cvData.types'
import { SavedCV, CVStatistics } from '@/types/savedCV.types'

interface CVDataState {
  currentCV: CVData | null
  savedCVs: SavedCV[]
  currentSavedCVId: string | null
  autoSaveEnabled: boolean

  // CV operations
  initializeCV: () => void
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  updateSummary: (summary: string) => void

  // Experience
  addExperience: (experience: Omit<Experience, 'id'>) => void
  updateExperience: (id: string, updates: Partial<Experience>) => void
  deleteExperience: (id: string) => void

  // Education
  addEducation: (education: Omit<Education, 'id'>) => void
  updateEducation: (id: string, updates: Partial<Education>) => void
  deleteEducation: (id: string) => void

  // Skills
  addSkill: (skill: Omit<Skill, 'id'>) => void
  updateSkill: (id: string, updates: Partial<Skill>) => void
  deleteSkill: (id: string) => void

  // Projects
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Save Management
  saveCurrentCV: (name: string, description?: string) => string
  updateSavedCV: (id: string, updates: Partial<SavedCV>) => void
  deleteSavedCV: (id: string) => void
  loadSavedCV: (id: string) => void
  duplicateSavedCV: (id: string) => void
  setPrimaryCv: (id: string) => void
  getSavedCVById: (id: string) => SavedCV | undefined
  getStatistics: () => CVStatistics

  // Cloud Sync
  syncToCloud: () => Promise<void>
  loadFromCloud: () => Promise<void>

  // General
  toggleAutoSave: () => void
}

const createEmptyCV = (): CVData => ({
  id: crypto.randomUUID(),
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '+1',
    location: {},
  },
  experience: [],
  education: [],
  skills: [],
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const useCVDataStore = create<CVDataState>()(
  persist(
    (set, get) => ({
      currentCV: null,
      savedCVs: [],
      currentSavedCVId: null,
      autoSaveEnabled: true,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,

      initializeCV: () => {
        if (!get().currentCV) {
          set({ currentCV: createEmptyCV() })
        }
      },

      updatePersonalInfo: (info) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              personalInfo: { ...state.currentCV.personalInfo, ...info },
              updatedAt: new Date(),
            },
          }
        })
      },

      updateSummary: (summary) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              summary,
              updatedAt: new Date(),
            },
          }
        })
      },

      // Experience
      addExperience: (experience) => {
        set((state) => {
          if (!state.currentCV) return state
          const newExperience: Experience = {
            ...experience,
            id: crypto.randomUUID(),
          }
          return {
            currentCV: {
              ...state.currentCV,
              experience: [...state.currentCV.experience, newExperience],
              updatedAt: new Date(),
            },
          }
        })
      },

      updateExperience: (id, updates) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              experience: state.currentCV.experience.map((exp) =>
                exp.id === id ? { ...exp, ...updates } : exp
              ),
              updatedAt: new Date(),
            },
          }
        })
      },

      deleteExperience: (id) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              experience: state.currentCV.experience.filter((exp) => exp.id !== id),
              updatedAt: new Date(),
            },
          }
        })
      },

      // Education
      addEducation: (education) => {
        set((state) => {
          if (!state.currentCV) return state
          const newEducation: Education = {
            ...education,
            id: crypto.randomUUID(),
          }
          return {
            currentCV: {
              ...state.currentCV,
              education: [...state.currentCV.education, newEducation],
              updatedAt: new Date(),
            },
          }
        })
      },

      updateEducation: (id, updates) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              education: state.currentCV.education.map((edu) =>
                edu.id === id ? { ...edu, ...updates } : edu
              ),
              updatedAt: new Date(),
            },
          }
        })
      },

      deleteEducation: (id) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              education: state.currentCV.education.filter((edu) => edu.id !== id),
              updatedAt: new Date(),
            },
          }
        })
      },

      // Skills
      addSkill: (skill) => {
        set((state) => {
          if (!state.currentCV) return state
          const newSkill: Skill = {
            ...skill,
            id: crypto.randomUUID(),
          }
          return {
            currentCV: {
              ...state.currentCV,
              skills: [...state.currentCV.skills, newSkill],
              updatedAt: new Date(),
            },
          }
        })
      },

      updateSkill: (id, updates) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              skills: state.currentCV.skills.map((skill) =>
                skill.id === id ? { ...skill, ...updates } : skill
              ),
              updatedAt: new Date(),
            },
          }
        })
      },

      deleteSkill: (id) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              skills: state.currentCV.skills.filter((skill) => skill.id !== id),
              updatedAt: new Date(),
            },
          }
        })
      },

      // Projects
      addProject: (project) => {
        set((state) => {
          if (!state.currentCV) return state
          const newProject: Project = {
            ...project,
            id: crypto.randomUUID(),
          }
          return {
            currentCV: {
              ...state.currentCV,
              projects: [...(state.currentCV.projects || []), newProject],
              updatedAt: new Date(),
            },
          }
        })
      },

      updateProject: (id, updates) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              projects: (state.currentCV.projects || []).map((proj) =>
                proj.id === id ? { ...proj, ...updates } : proj
              ),
              updatedAt: new Date(),
            },
          }
        })
      },

      deleteProject: (id) => {
        set((state) => {
          if (!state.currentCV) return state
          return {
            currentCV: {
              ...state.currentCV,
              projects: (state.currentCV.projects || []).filter((proj) => proj.id !== id),
              updatedAt: new Date(),
            },
          }
        })
      },

      // Save Management
      saveCurrentCV: (name, description) => {
        const { currentCV, savedCVs, currentSavedCVId } = get()
        if (!currentCV) throw new Error('No CV to save')

        const existingCV = savedCVs.find((cv) => cv.id === currentSavedCVId)

        if (existingCV) {
          // Update existing
          const updatedCV = {
            ...existingCV,
            name,
            description,
            cvData: currentCV,
            lastModified: new Date(),
            version: existingCV.version + 1,
          }

          set((state) => ({
            savedCVs: state.savedCVs.map((cv) => (cv.id === existingCV.id ? updatedCV : cv)),
          }))

          // Sync to cloud
          const { user } = useAuthStore.getState()
          if (user) {
            firestoreService.saveCV(user.uid, updatedCV).catch(console.error)
          }

          return existingCV.id
        } else {
          // Create new
          const newSavedCV: SavedCV = {
            id: crypto.randomUUID(),
            name,
            description,
            cvData: currentCV,
            templateId: 'template-modern',
            lastModified: new Date(),
            createdAt: new Date(),
            tags: [],
            isPrimary: savedCVs.length === 0,
            version: 1,
          }

          set((state) => ({
            savedCVs: [...state.savedCVs, newSavedCV],
            currentSavedCVId: newSavedCV.id,
          }))

          // Sync to cloud
          const { user } = useAuthStore.getState()
          if (user) {
            firestoreService.saveCV(user.uid, newSavedCV).catch(console.error)
          }

          return newSavedCV.id
        }
      },

      updateSavedCV: (id, updates) => {
        set((state) => ({
          savedCVs: state.savedCVs.map((cv) =>
            cv.id === id ? { ...cv, ...updates, lastModified: new Date() } : cv
          ),
        }))
      },

      deleteSavedCV: (id) => {
        set((state) => ({
          savedCVs: state.savedCVs.filter((cv) => cv.id !== id),
          currentSavedCVId: state.currentSavedCVId === id ? null : state.currentSavedCVId,
        }))

        // Delete from cloud
        const { user } = useAuthStore.getState()
        if (user) {
          firestoreService.deleteCV(id).catch(console.error)
        }
      },

      loadSavedCV: (id) => {
        const savedCV = get().savedCVs.find((cv) => cv.id === id)
        if (savedCV) {
          set({
            currentCV: savedCV.cvData,
            currentSavedCVId: id,
          })
        }
      },

      duplicateSavedCV: (id) => {
        const original = get().savedCVs.find((cv) => cv.id === id)
        if (!original) return

        const duplicate: SavedCV = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`,
          createdAt: new Date(),
          lastModified: new Date(),
          isPrimary: false,
          version: 1,
        }

        set((state) => ({
          savedCVs: [...state.savedCVs, duplicate],
        }))
      },

      setPrimaryCv: (id) => {
        set((state) => ({
          savedCVs: state.savedCVs.map((cv) => ({
            ...cv,
            isPrimary: cv.id === id,
          })),
        }))
      },

      getSavedCVById: (id) => {
        return get().savedCVs.find((cv) => cv.id === id)
      },

      getStatistics: () => {
        const { savedCVs } = get()

        return {
          totalCVs: savedCVs.length,
          avgAtsScore:
            savedCVs.reduce((acc, cv) => acc + (cv.atsScore || 0), 0) / savedCVs.length || 0,
          lastModified:
            savedCVs.length > 0
              ? new Date(Math.max(...savedCVs.map((cv) => cv.lastModified.getTime())))
              : new Date(),
          mostUsedTemplate: savedCVs.length > 0 ? savedCVs[0].templateId : '',
          totalApplications: 0,
        }
      },

      // Cloud Sync
      syncToCloud: async () => {
        const { user } = useAuthStore.getState()
        if (!user) {
          console.warn('No user logged in, skipping cloud sync')
          return
        }

        const { savedCVs } = get()
        set({ isSyncing: true, syncError: null })

        try {
          await firestoreService.syncCVs(user.uid, savedCVs)
          set({ lastSyncTime: new Date(), isSyncing: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sync failed'
          set({ syncError: errorMessage, isSyncing: false })
          throw error
        }
      },

      loadFromCloud: async () => {
        const { user } = useAuthStore.getState()
        if (!user) {
          console.warn('No user logged in, skipping cloud load')
          return
        }

        set({ isSyncing: true, syncError: null })

        try {
          const cloudCVs = await firestoreService.getUserCVs(user.uid)
          const { savedCVs } = get()

          // Merge strategy: cloud CVs take precedence if newer
          const mergedCVs = [...cloudCVs]

          savedCVs.forEach((localCV) => {
            const cloudCV = cloudCVs.find((cv) => cv.id === localCV.id)
            if (!cloudCV) {
              // Local CV not in cloud, add it
              mergedCVs.push(localCV)
            } else if (localCV.lastModified > cloudCV.lastModified) {
              // Local CV is newer, use local version
              const index = mergedCVs.findIndex((cv) => cv.id === localCV.id)
              mergedCVs[index] = localCV
            }
          })

          set({
            savedCVs: mergedCVs,
            lastSyncTime: new Date(),
            isSyncing: false,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Load failed'
          set({ syncError: errorMessage, isSyncing: false })
          throw error
        }
      },

      // General
      toggleAutoSave: () => {
        set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled }))
      },
    }),
    {
      name: 'cv-data-storage',
    }
  )
)
