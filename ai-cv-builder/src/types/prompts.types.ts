/**
 * Prompt Library Types - Step 30
 * Types for managing reusable prompts and folders
 */

/**
 * Prompt Folder for organization
 */
export interface PromptFolder {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Saved Prompt
 */
export interface SavedPrompt {
  id: string
  name: string
  folderId?: string
  body: string // freeform text appended to system prompt
  createdAt: Date
  updatedAt: Date
}
