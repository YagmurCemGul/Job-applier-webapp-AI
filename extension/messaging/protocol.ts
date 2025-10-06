/**
 * Message protocol between web app and extension
 */

export type DomainKey = 'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin' | 'generic'

export interface ApplyStartMsg {
  type: 'APPLY_START'
  payload: {
    jobUrl: string
    platform: DomainKey
    files: Array<{ name: string; url: string; type: 'cv' | 'coverLetter' }>
    answers?: Record<string, string | boolean | string[]>
    dryRun?: boolean
    locale?: 'en' | 'tr'
  }
  meta: {
    requestId: string
    ts: number
    origin: string
    sign?: string
  }
}

export interface ApplyResultMsg {
  type: 'APPLY_RESULT'
  payload: {
    ok: boolean
    message?: string
    url?: string
    submitted?: boolean
    reviewNeeded?: boolean
    hints?: string[]
  }
  meta: {
    requestId: string
    ts: number
  }
}

export interface ImportJobMsg {
  type: 'IMPORT_JOB'
  payload: {
    url: string
    title?: string
    company?: string
    location?: string
    description?: string
    salary?: string
    remote?: boolean
    platform?: string
  }
  meta: {
    ts: number
  }
}

export interface GenerateTextMsg {
  type: 'GENERATE_TEXT'
  payload: {
    prompt: string
    context?: string
  }
  meta: {
    requestId: string
    ts: number
  }
}

export interface GenerateTextResultMsg {
  type: 'GENERATE_TEXT_RESULT'
  payload: {
    ok: boolean
    text?: string
    error?: string
  }
  meta: {
    requestId: string
    ts: number
  }
}

export type ExtensionMessage =
  | ApplyStartMsg
  | ApplyResultMsg
  | ImportJobMsg
  | GenerateTextMsg
  | GenerateTextResultMsg

export interface RunLog {
  id: string
  ts: number
  domain: string
  status: 'success' | 'error' | 'review'
  message: string
  url?: string
}
