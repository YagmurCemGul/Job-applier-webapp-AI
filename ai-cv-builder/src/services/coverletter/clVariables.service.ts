/**
 * Cover Letter Variables Service - Step 30
 * Handles variable substitution and text utilities
 */

import type { CVData } from '@/types/cv.types'

/**
 * Sanitize HTML content
 * Basic implementation - can be enhanced with DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Remove potentially dangerous tags and scripts
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}

/**
 * Build variables from CV and job context
 */
export function buildVariables(opts: {
  cv: CVData
  job?: { title?: string; company?: string; recruiterName?: string }
  extra?: Record<string, string>
}): Record<string, string> {
  const vars: Record<string, string> = {
    Company: opts.job?.company ?? '',
    Role: opts.job?.title ?? '',
    RecruiterName: opts.job?.recruiterName ?? 'Hiring Manager',
    YourName: opts.cv?.personalInfo?.fullName ?? '',
    Skills: deriveSkills(opts.cv),
    WhyUs: '',
    Closing: '',
  }
  return { ...vars, ...(opts.extra ?? {}) }
}

/**
 * Derive skills summary from CV
 */
function deriveSkills(cv: CVData): string {
  const skills = cv.skills ?? []
  const topSkills = skills.slice(0, 8).map((s) => s.name || s).join(', ')
  return topSkills
    ? `Key strengths include ${topSkills}.`
    : 'Strong technical and professional skills.'
}

/**
 * Convert HTML to plain text
 */
export function toPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
