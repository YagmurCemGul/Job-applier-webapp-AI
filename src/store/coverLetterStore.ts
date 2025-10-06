import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CoverLetterDoc, CoverLetterMeta } from '@/types/coverletter.types'
import DOMPurify from 'isomorphic-dompurify'

interface CLState {
  items: CoverLetterDoc[]
  activeId?: string
  loading: boolean
  error?: string

  create: (init: Partial<CoverLetterDoc> & { name: string }) => string
  updateContent: (id: string, html: string, note?: string) => void
  upsertVars: (id: string, vars: Record<string, string>) => void
  setMeta: (id: string, patch: Partial<CoverLetterMeta>) => void
  select: (id?: string) => void
  remove: (id: string) => void
  duplicate: (id: string) => string | undefined
  toggleFavorite: (id: string) => void
}

function rid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `cl_${Math.random().toString(36).slice(2)}`
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'data-*', 'style'],
  })
}

export const useCoverLetterStore = create<CLState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      create: (init) => {
        const id = rid()
        const now = new Date()
        const doc: CoverLetterDoc = {
          meta: {
            id,
            name: init.name,
            linkedJobId: init.linkedJobId,
            linkedVariantId: init.linkedVariantId,
            favorite: false,
            createdAt: now,
            updatedAt: now,
            notes: '',
          },
          content: sanitizeHtml(init.content ?? ''),
          plain: '',
          tone: init.tone ?? 'formal',
          length: init.length ?? 'medium',
          lang: init.lang ?? 'en',
          templateId: init.templateId ?? 'cl-01',
          variables: init.variables ?? {},
          promptsUsed: init.promptsUsed ?? [],
          history: [{ id: rid(), at: now, note: 'init', content: sanitizeHtml(init.content ?? '') }],
        }
        set({ items: [doc, ...get().items], activeId: id })
        return id
      },

      updateContent: (id, html, note) => {
        const items = get().items.map((d) => {
          if (d.meta.id !== id) return d
          const safe = sanitizeHtml(html)
          const now = new Date()
          return {
            ...d,
            content: safe,
            meta: { ...d.meta, updatedAt: now },
            history: [{ id: rid(), at: now, note: note || 'edit', content: safe }, ...d.history].slice(
              0,
              25
            ),
          }
        })
        set({ items })
      },

      upsertVars: (id, vars) =>
        set({
          items: get().items.map((d) =>
            d.meta.id === id ? { ...d, variables: { ...d.variables, ...vars } } : d
          ),
        }),

      setMeta: (id, patch) =>
        set({
          items: get().items.map((d) =>
            d.meta.id === id ? { ...d, meta: { ...d.meta, ...patch, updatedAt: new Date() } } : d
          ),
        }),

      select: (id) => set({ activeId: id }),

      remove: (id) =>
        set({
          items: get().items.filter((d) => d.meta.id !== id),
          activeId: get().activeId === id ? undefined : get().activeId,
        }),

      duplicate: (id) => {
        const d = get().items.find((x) => x.meta.id === id)
        if (!d) return
        const newId = rid()
        const now = new Date()
        const copy: CoverLetterDoc = {
          ...d,
          meta: {
            ...d.meta,
            id: newId,
            name: d.meta.name + ' (Copy)',
            createdAt: now,
            updatedAt: now,
          },
          history: [{ id: rid(), at: now, note: 'duplicate', content: d.content }, ...d.history],
        }
        set({ items: [copy, ...get().items] })
        return newId
      },

      toggleFavorite: (id) =>
        set({
          items: get().items.map((d) =>
            d.meta.id === id ? { ...d, meta: { ...d.meta, favorite: !d.meta.favorite } } : d
          ),
        }),
    }),
    {
      name: 'cover-letters',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ activeId: s.activeId, items: s.items }),
      version: 1,
    }
  )
)
