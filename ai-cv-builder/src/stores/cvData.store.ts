import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CVData, PersonalInfo, Experience, Education, Skill, Project } from '@/types/cvData.types'

interface CVDataState {
  currentCV: CVData | null
  savedCVs: CVData[]
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
  
  // General
  saveCV: (name?: string) => void
  loadCV: (id: string) => void
  deleteCV: (id: string) => void
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
      autoSaveEnabled: true,

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

      // General
      saveCV: (name) => {
        const currentCV = get().currentCV
        if (!currentCV) return

        set((state) => ({
          savedCVs: [...state.savedCVs, { ...currentCV, updatedAt: new Date() }],
        }))
      },

      loadCV: (id) => {
        const cv = get().savedCVs.find((cv) => cv.id === id)
        if (cv) {
          set({ currentCV: cv })
        }
      },

      deleteCV: (id) => {
        set((state) => ({
          savedCVs: state.savedCVs.filter((cv) => cv.id !== id),
        }))
      },

      toggleAutoSave: () => {
        set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled }))
      },
    }),
    {
      name: 'cv-data-storage',
    }
  )
)
