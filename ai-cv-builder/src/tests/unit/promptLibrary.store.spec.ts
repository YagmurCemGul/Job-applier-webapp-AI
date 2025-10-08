/**
 * Prompt Library Store Tests - Step 30
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { usePromptLibrary } from '@/stores/promptLibrary.store'

describe('promptLibrary.store', () => {
  beforeEach(() => {
    // Reset store
    const store = usePromptLibrary.getState()
    store.folders.forEach((f) => store.deleteFolder(f.id))
    store.prompts.forEach((p) => store.deletePrompt(p.id))
  })

  it('should create a folder', () => {
    const store = usePromptLibrary.getState()
    const id = store.upsertFolder('Test Folder')

    expect(id).toBeTruthy()
    expect(store.folders).toHaveLength(1)
    expect(store.folders[0].name).toBe('Test Folder')
  })

  it('should create a prompt', () => {
    const store = usePromptLibrary.getState()
    const id = store.upsertPrompt({
      name: 'Test Prompt',
      body: 'Emphasize leadership skills',
    })

    expect(id).toBeTruthy()
    expect(store.prompts).toHaveLength(1)
    expect(store.prompts[0].body).toBe('Emphasize leadership skills')
  })

  it('should assign prompt to folder', () => {
    const store = usePromptLibrary.getState()
    const folderId = store.upsertFolder('Work')
    const promptId = store.upsertPrompt({
      name: 'Prompt 1',
      body: 'Test',
      folderId,
    })

    const prompt = store.prompts.find((p) => p.id === promptId)
    expect(prompt?.folderId).toBe(folderId)
  })

  it('should list prompts by folder', () => {
    const store = usePromptLibrary.getState()
    const f1 = store.upsertFolder('Folder 1')
    const f2 = store.upsertFolder('Folder 2')

    store.upsertPrompt({ name: 'P1', body: 'Test', folderId: f1 })
    store.upsertPrompt({ name: 'P2', body: 'Test', folderId: f1 })
    store.upsertPrompt({ name: 'P3', body: 'Test', folderId: f2 })
    store.upsertPrompt({ name: 'P4', body: 'Test' })

    const f1Prompts = store.listByFolder(f1)
    const f2Prompts = store.listByFolder(f2)
    const noFolder = store.listByFolder(undefined)

    expect(f1Prompts).toHaveLength(2)
    expect(f2Prompts).toHaveLength(1)
    expect(noFolder).toHaveLength(1)
  })

  it('should delete folder and unlink prompts', () => {
    const store = usePromptLibrary.getState()
    const folderId = store.upsertFolder('Temp')
    store.upsertPrompt({ name: 'P1', body: 'Test', folderId })

    store.deleteFolder(folderId)

    expect(store.folders).toHaveLength(0)
    expect(store.prompts[0].folderId).toBeUndefined()
  })

  it('should delete prompt', () => {
    const store = usePromptLibrary.getState()
    const id = store.upsertPrompt({ name: 'Test', body: 'Body' })

    expect(store.prompts).toHaveLength(1)
    store.deletePrompt(id)
    expect(store.prompts).toHaveLength(0)
  })
})
