import { User } from './user.types'
import { CV } from './cv.types'
import { Job } from './job.types'

// User Store
export interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface UserActions {
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export type UserStore = UserState & UserActions

// CV Store
export interface CVState {
  cvs: CV[]
  currentCV: CV | null
  isEditing: boolean
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
}

export interface CVActions {
  setCVs: (cvs: CV[]) => void
  addCV: (cv: CV) => void
  updateCV: (id: string, updates: Partial<CV>) => void
  deleteCV: (id: string) => void
  setCurrentCV: (cv: CV | null) => void
  setEditing: (editing: boolean) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
  setError: (error: string | null) => void
  clearCVs: () => void
}

export type CVStore = CVState & CVActions

// Job Store
export interface JobState {
  jobs: Job[]
  currentJob: Job | null
  filters: JobFilters
  isLoading: boolean
  error: string | null
  savedJobs: string[] // Job IDs
  appliedJobs: string[] // Job IDs
}

export interface JobFilters {
  keyword: string
  location: string
  remote: boolean | null
  jobType: string[]
  salaryMin: number | null
  salaryMax: number | null
  experienceLevel: string[]
  datePosted: string | null
}

export interface JobActions {
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  setCurrentJob: (job: Job | null) => void
  setFilters: (filters: Partial<JobFilters>) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  saveJob: (jobId: string) => void
  unsaveJob: (jobId: string) => void
  applyToJob: (jobId: string) => void
  clearJobs: () => void
}

export type JobStore = JobState & JobActions

// UI Store
export interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface Modal {
  id: string
  component: string
  props?: Record<string, unknown>
}

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'tr'
  sidebarCollapsed: boolean
  toasts: Toast[]
  modals: Modal[]
  isLoading: boolean
  loadingMessage: string | null
}

export interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: 'en' | 'tr') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  openModal: (modal: Omit<Modal, 'id'>) => void
  closeModal: (id: string) => void
  clearModals: () => void
  setGlobalLoading: (loading: boolean, message?: string) => void
}

export type UIStore = UIState & UIActions

// Profile Store (for multi-profile support)
export interface ProfileData {
  id: string
  name: string
  userId: string
  cvId: string | null
  category: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProfileState {
  profiles: ProfileData[]
  currentProfile: ProfileData | null
  isLoading: boolean
  error: string | null
}

export interface ProfileActions {
  setProfiles: (profiles: ProfileData[]) => void
  addProfile: (profile: ProfileData) => void
  updateProfile: (id: string, updates: Partial<ProfileData>) => void
  deleteProfile: (id: string) => void
  setCurrentProfile: (profile: ProfileData | null) => void
  setPrimaryProfile: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearProfiles: () => void
}

export type ProfileStore = ProfileState & ProfileActions
