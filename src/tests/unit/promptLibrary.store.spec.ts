import { describe, it, expect, beforeEach } from 'vitest'
import { usePromptLibraryStore } from '@/store/promptLibraryStore'

describe('promptLibraryStore', () => {
  beforeEach(() => {
    // Reset store
    usePromptLibraryStore.setState({
      folders: [],
      prompts: [],
    })
  })

  it('should initialize with empty state', () => {
    const state = usePromptLibraryStore.getState()
    expect(state.folders).toEqual([])
    expect(state.prompts).toEqual([])
  })

  it('should upsert folder', () => {
    const { upsertFolder } = usePromptLibraryStore.getState()
    const id = upsertFolder('Test Folder')

    expect(id).toBeDefined()
    const state = usePromptLibraryStore.getState()
    expect(state.folders).toHaveLength(1)
    expect(state.folders[0].name).toBe('Test Folder')
  })

  it('should delete folder', () => {
    const { upsertFolder, deleteFolder } = usePromptLibraryStore.getState()
    const id = upsertFolder('Test Folder')

    deleteFolder(id)
    expect(usePromptLibraryStore.getState().folders).toHaveLength(0)
  })

  it('should upsert prompt', () => {
    const { upsertPrompt } = usePromptLibraryStore.getState()
    const id = upsertPrompt({
      name: 'Test Prompt',
      body: 'This is a test prompt',
    })

    expect(id).toBeDefined()
    const state = usePromptLibraryStore.getState()
    expect(state.prompts).toHaveLength(1)
    expect(state.prompts[0].name).toBe('Test Prompt')
    expect(state.prompts[0].body).toBe('This is a test prompt')
  })

  it('should delete prompt', () => {
    const { upsertPrompt, deletePrompt } = usePromptLibraryStore.getState()
    const id = upsertPrompt({
      name: 'Test',
      body: 'Body',
    })

    deletePrompt(id)
    expect(usePromptLibraryStore.getState().prompts).toHaveLength(0)
  })

  it('should list prompts by folder', () => {
    const { upsertFolder, upsertPrompt, listByFolder } = usePromptLibraryStore.getState()
    const folderId = upsertFolder('Folder1')

    upsertPrompt({ name: 'Prompt1', body: 'Body1', folderId })
    upsertPrompt({ name: 'Prompt2', body: 'Body2' })

    const folderPrompts = listByFolder(folderId)
    expect(folderPrompts).toHaveLength(1)
    expect(folderPrompts[0].name).toBe('Prompt1')

    const unfoldered = listByFolder(undefined)
    expect(unfoldered).toHaveLength(1)
    expect(unfoldered[0].name).toBe('Prompt2')
  })

  it('should update folder to remove prompts when deleted', () => {
    const { upsertFolder, upsertPrompt, deleteFolder } = usePromptLibraryStore.getState()
    const folderId = upsertFolder('Folder1')

    upsertPrompt({ name: 'Prompt1', body: 'Body1', folderId })

    deleteFolder(folderId)

    const state = usePromptLibraryStore.getState()
    expect(state.folders).toHaveLength(0)
    expect(state.prompts[0].folderId).toBeUndefined()
  })

  it('should update existing prompt', () => {
    const { upsertPrompt } = usePromptLibraryStore.getState()
    const id = upsertPrompt({ name: 'Original', body: 'Original Body' })

    upsertPrompt({ id, name: 'Updated', body: 'Updated Body' })

    const state = usePromptLibraryStore.getState()
    expect(state.prompts).toHaveLength(1)
    expect(state.prompts[0].name).toBe('Updated')
    expect(state.prompts[0].body).toBe('Updated Body')
  })
})
