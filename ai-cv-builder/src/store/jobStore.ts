import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { JobStore, JobFilters } from '@/types/store.types'
import { Job } from '@/types/job.types'

const initialFilters: JobFilters = {
  keyword: '',
  location: '',
  remote: null,
  jobType: [],
  salaryMin: null,
  salaryMax: null,
  experienceLevel: [],
  datePosted: null,
}

const initialState = {
  jobs: [],
  currentJob: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  savedJobs: [],
  appliedJobs: [],
}

export const useJobStore = create<JobStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setJobs: (jobs: Job[]) =>
        set((state) => {
          state.jobs = jobs
        }),

      addJob: (job: Job) =>
        set((state) => {
          state.jobs.push(job)
        }),

      setCurrentJob: (job: Job | null) =>
        set((state) => {
          state.currentJob = job
        }),

      setFilters: (filters: Partial<JobFilters>) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters }
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = initialFilters
        }),

      setLoading: (loading: boolean) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (error: string | null) =>
        set((state) => {
          state.error = error
        }),

      saveJob: (jobId: string) =>
        set((state) => {
          if (!state.savedJobs.includes(jobId)) {
            state.savedJobs.push(jobId)
          }
        }),

      unsaveJob: (jobId: string) =>
        set((state) => {
          state.savedJobs = state.savedJobs.filter((id) => id !== jobId)
        }),

      applyToJob: (jobId: string) =>
        set((state) => {
          if (!state.appliedJobs.includes(jobId)) {
            state.appliedJobs.push(jobId)
          }
        }),

      clearJobs: () =>
        set((state) => {
          state.jobs = []
          state.currentJob = null
          state.error = null
        }),
    })),
    {
      name: 'job-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedJobs: state.savedJobs,
        appliedJobs: state.appliedJobs,
        filters: state.filters,
      }),
    }
  )
)