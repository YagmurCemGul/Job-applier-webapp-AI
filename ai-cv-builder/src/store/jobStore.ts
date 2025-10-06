import { create } from 'zustand'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface JobState {
  // Job store will be implemented in later steps
}

export const useJobStore = create<JobState>(() => ({}))
