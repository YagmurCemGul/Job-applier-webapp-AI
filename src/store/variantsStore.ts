import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CVVariant, VariantMeta, VariantDiff } from '@/types/variants.types'
import type { CVData } from '@/types/cvData.types'
import { computeDiff } from '@/services/variants/diff.service'
import { snapshotATSAtCreation } from '@/services/variants/snapshot.service'

interface VariantsState {
  items: CVVariant[]
  activeId?: string
  loading: boolean
  error?: string

  createFromCurrent: (
    name: string,
    opts?: { linkedJobId?: string; note?: string }
  ) => string | undefined
  createFromJob: (jobId: string, name: string, note?: string) => string | undefined
  rename: (id: string, nextName: string) => void
  note: (id: string, note: string) => void
  select: (id?: string) => void
  delete: (id: string) => void

  diffAgainstBase: (id: string) => VariantDiff | undefined
  revertToHistory: (id: string, historyId: string) => void
  addHistory: (id: string, note?: string) => void
}

function rid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `v_${Math.random().toString(36).slice(2)}`
}

function getBaseId(): string {
  // A stable id of current base CV (could be user id + root CV id if available)
  return 'base'
}

export const useVariantsStore = create<VariantsState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      createFromCurrent: (name, opts) => {
        const { useCVDataStore } = require('@/store/cvDataStore')
        const baseCv = useCVDataStore.getState().currentCV
        if (!baseCv) return

        const now = new Date()
        const id = rid()
        const meta: VariantMeta = {
          id,
          name,
          linkedJobId: opts?.linkedJobId,
          notes: opts?.note,
          createdAt: now,
          updatedAt: now,
          atsAtCreate: snapshotATSAtCreation(),
        }

        const variant: CVVariant = {
          meta,
          cv: structuredClone(baseCv),
          baseCvId: getBaseId(),
          history: [{ id: rid(), at: now, note: 'init', cv: structuredClone(baseCv) }],
        }

        set({ items: [variant, ...get().items], activeId: id })
        return id
      },

      createFromJob: (jobId, name, note) => {
        return get().createFromCurrent(name, { linkedJobId: jobId, note })
      },

      rename: (id, nextName) => {
        set({
          items: get().items.map((v) =>
            v.meta.id === id
              ? { ...v, meta: { ...v.meta, name: nextName, updatedAt: new Date() } }
              : v
          ),
        })
      },

      note: (id, note) => {
        set({
          items: get().items.map((v) =>
            v.meta.id === id
              ? { ...v, meta: { ...v.meta, notes: note, updatedAt: new Date() } }
              : v
          ),
        })
      },

      select: (id) => set({ activeId: id }),

      delete: (id) =>
        set({
          items: get().items.filter((v) => v.meta.id !== id),
          activeId: get().activeId === id ? undefined : get().activeId,
        }),

      diffAgainstBase: (id) => {
        const { useCVDataStore } = require('@/store/cvDataStore')
        const baseCv = useCVDataStore.getState().currentCV
        const v = get().items.find((x) => x.meta.id === id)
        if (!v || !baseCv) return
        return computeDiff(baseCv, v.cv)
      },

      addHistory: (id, note) => {
        const { useCVDataStore } = require('@/store/cvDataStore')
        const v = get().items.find((x) => x.meta.id === id)
        if (!v) return

        const snap = structuredClone(useCVDataStore.getState().currentCV)
        if (!snap) return

        v.history.unshift({ id: rid(), at: new Date(), note, cv: snap })
        v.meta.updatedAt = new Date()
        set({ items: get().items.map((x) => (x.meta.id === id ? v : x)) })
      },

      revertToHistory: (id, historyId) => {
        const v = get().items.find((x) => x.meta.id === id)
        if (!v) return

        const h = v.history.find((x) => x.id === historyId)
        if (!h) return

        v.cv = structuredClone(h.cv)
        v.meta.updatedAt = new Date()
        set({ items: get().items.map((x) => (x.meta.id === id ? v : x)) })

        // Also push into the global CV store so preview reflects revert
        const { useCVDataStore } = require('@/store/cvDataStore')
        useCVDataStore.getState().loadCV(structuredClone(h.cv))
      },
    }),
    {
      name: 'variants-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ activeId: s.activeId, items: s.items }),
      version: 1,
    }
  )
)
