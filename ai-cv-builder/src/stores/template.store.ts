import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CVTemplate, DEFAULT_TEMPLATES } from '@/types/template.types'

interface TemplateState {
  templates: CVTemplate[]
  selectedTemplateId: string | null
  customTemplates: CVTemplate[]
  
  // Template operations
  initializeTemplates: () => void
  selectTemplate: (id: string) => void
  getSelectedTemplate: () => CVTemplate | undefined
  addCustomTemplate: (template: Omit<CVTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTemplate: (id: string, updates: Partial<CVTemplate>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string) => void
  
  // Section operations
  toggleSection: (templateId: string, sectionId: string) => void
  reorderSections: (templateId: string, newOrder: string[]) => void
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      selectedTemplateId: null,
      customTemplates: [],

      initializeTemplates: () => {
        const templates = DEFAULT_TEMPLATES.map((t) => ({
          ...t,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        
        set({
          templates,
          selectedTemplateId: templates.find((t) => t.isDefault)?.id || templates[0]?.id,
        })
      },

      selectTemplate: (id) => {
        set({ selectedTemplateId: id })
      },

      getSelectedTemplate: () => {
        const { templates, selectedTemplateId } = get()
        return templates.find((t) => t.id === selectedTemplateId)
      },

      addCustomTemplate: (templateData) => {
        const newTemplate: CVTemplate = {
          ...templateData,
          id: `custom-${crypto.randomUUID()}`,
          category: 'custom',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          templates: [...state.templates, newTemplate],
          customTemplates: [...state.customTemplates, newTemplate],
        }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
          customTemplates: state.customTemplates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          customTemplates: state.customTemplates.filter((t) => t.id !== id),
          selectedTemplateId:
            state.selectedTemplateId === id
              ? state.templates.find((t) => t.isDefault)?.id
              : state.selectedTemplateId,
        }))
      },

      duplicateTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id)
        if (!template) return

        const duplicated: CVTemplate = {
          ...template,
          id: `custom-${crypto.randomUUID()}`,
          name: `${template.name} (Copy)`,
          category: 'custom',
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          templates: [...state.templates, duplicated],
          customTemplates: [...state.customTemplates, duplicated],
        }))
      },

      toggleSection: (templateId, sectionId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  structure: {
                    ...t.structure,
                    sections: t.structure.sections.map((s) =>
                      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
                    ),
                  },
                  updatedAt: new Date(),
                }
              : t
          ),
        }))
      },

      reorderSections: (templateId, newOrder) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  structure: { ...t.structure, order: newOrder },
                  updatedAt: new Date(),
                }
              : t
          ),
        }))
      },
    }),
    {
      name: 'template-storage',
    }
  )
)