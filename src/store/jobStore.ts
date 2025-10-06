import { create } from 'zustand'
import { Job } from '@/types'

interface JobState {
  jobs: Job[]
  currentJob: Job | null
  setCurrentJob: (job: Job | null) => void
  addJob: (job: Job) => void
  updateJob: (id: string, job: Partial<Job>) => void
  deleteJob: (id: string) => void
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  currentJob: null,
  setCurrentJob: (job) => set({ currentJob: job }),
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updates } : job)),
    })),
  deleteJob: (id) => set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id) })),
}))
