/**
 * Page parser utilities
 */

import type { ImportJobMsg } from '../../messaging/protocol'

export interface ParsedJob {
  title?: string
  company?: string
  location?: string
  description?: string
  salary?: string
  remote?: boolean
  platform?: string
}

/**
 * Extract job metadata from the page
 */
export function parsePage(platform: string): ParsedJob {
  const job: ParsedJob = {
    platform,
    title: extractTitle(),
    company: extractCompany(),
    location: extractLocation(),
    description: extractDescription(),
    salary: extractSalary(),
    remote: detectRemote()
  }

  return job
}

function extractTitle(): string | undefined {
  // Try common selectors
  const selectors = [
    'h1[class*="title"]',
    'h1[class*="job"]',
    '[data-qa*="title"]',
    '[data-testid*="title"]',
    'h1'
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el && el.textContent?.trim()) {
      return el.textContent.trim()
    }
  }

  // Try meta tags
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) {
    return ogTitle.getAttribute('content') || undefined
  }

  return document.title
}

function extractCompany(): string | undefined {
  // Try common selectors
  const selectors = [
    '[class*="company"]',
    '[data-qa*="company"]',
    '[data-testid*="company"]'
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el && el.textContent?.trim()) {
      return el.textContent.trim()
    }
  }

  return undefined
}

function extractLocation(): string | undefined {
  // Try common selectors
  const selectors = [
    '[class*="location"]',
    '[data-qa*="location"]',
    '[data-testid*="location"]'
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el && el.textContent?.trim()) {
      return el.textContent.trim()
    }
  }

  return undefined
}

function extractDescription(): string | undefined {
  // Try common selectors
  const selectors = [
    '[class*="description"]',
    '[class*="content"]',
    '[data-qa*="description"]',
    'article',
    'main'
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (el && el.textContent) {
      const text = el.textContent.trim()
      // Cap at 5000 chars
      return text.length > 5000 ? text.slice(0, 5000) + '...' : text
    }
  }

  return undefined
}

function extractSalary(): string | undefined {
  // Search for salary patterns
  const text = document.body.textContent || ''
  const patterns = [
    /\$[\d,]+\s*-\s*\$[\d,]+/,
    /[\d,]+\s*-\s*[\d,]+\s*(?:USD|EUR|GBP)/i,
    /salary:?\s*[\d,]+/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return undefined
}

function detectRemote(): boolean {
  const text = (document.body.textContent || '').toLowerCase()
  const keywords = ['remote', 'work from home', 'wfh', 'hybrid', 'distributed']

  return keywords.some((keyword) => text.includes(keyword))
}

/**
 * Create ImportJobMsg from parsed data
 */
export function createImportMessage(job: ParsedJob): ImportJobMsg {
  return {
    type: 'IMPORT_JOB',
    payload: {
      url: window.location.href,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary: job.salary,
      remote: job.remote,
      platform: job.platform
    },
    meta: {
      ts: Date.now()
    }
  }
}
