/**
 * Autofill utilities for form fields
 */

import { normalizeText, scrollIntoView } from './dom'

export interface FillResult {
  ok: boolean
  field: string
  filled: boolean
  message?: string
}

/**
 * Fill a text input or textarea
 */
export function fillText(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  force: boolean = false
): FillResult {
  const fieldName =
    element.name || element.id || element.placeholder || 'unknown'

  // Don't overwrite unless force
  if (!force && element.value.trim()) {
    return {
      ok: true,
      field: fieldName,
      filled: false,
      message: 'Field already has value'
    }
  }

  scrollIntoView(element)
  element.focus()
  element.value = value

  // Dispatch events
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
  element.dispatchEvent(new Event('blur', { bubbles: true }))

  return {
    ok: true,
    field: fieldName,
    filled: true
  }
}

/**
 * Fill a select dropdown
 */
export function fillSelect(
  element: HTMLSelectElement,
  value: string,
  force: boolean = false
): FillResult {
  const fieldName =
    element.name || element.id || element.getAttribute('aria-label') || 'unknown'

  if (!force && element.value) {
    return {
      ok: true,
      field: fieldName,
      filled: false,
      message: 'Field already has value'
    }
  }

  const normalized = normalizeText(value)
  const options = Array.from(element.options)

  // Try exact match
  for (const option of options) {
    if (normalizeText(option.text) === normalized || option.value === value) {
      scrollIntoView(element)
      element.value = option.value
      element.dispatchEvent(new Event('change', { bubbles: true }))
      return { ok: true, field: fieldName, filled: true }
    }
  }

  // Try partial match
  for (const option of options) {
    if (normalizeText(option.text).includes(normalized)) {
      scrollIntoView(element)
      element.value = option.value
      element.dispatchEvent(new Event('change', { bubbles: true }))
      return { ok: true, field: fieldName, filled: true }
    }
  }

  return {
    ok: false,
    field: fieldName,
    filled: false,
    message: `No matching option for "${value}"`
  }
}

/**
 * Fill a radio button group
 */
export function fillRadio(
  name: string,
  value: string
): FillResult {
  const radios = Array.from(
    document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`)
  )

  if (radios.length === 0) {
    return {
      ok: false,
      field: name,
      filled: false,
      message: 'No radio buttons found'
    }
  }

  const normalized = normalizeText(value)

  for (const radio of radios) {
    // Try label text
    const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`)
    if (label) {
      const labelText = normalizeText(label.textContent || '')
      if (labelText.includes(normalized) || normalized.includes(labelText)) {
        scrollIntoView(radio)
        radio.checked = true
        radio.dispatchEvent(new Event('change', { bubbles: true }))
        return { ok: true, field: name, filled: true }
      }
    }

    // Try value
    if (radio.value === value) {
      scrollIntoView(radio)
      radio.checked = true
      radio.dispatchEvent(new Event('change', { bubbles: true }))
      return { ok: true, field: name, filled: true }
    }
  }

  return {
    ok: false,
    field: name,
    filled: false,
    message: `No matching radio for "${value}"`
  }
}

/**
 * Fill a checkbox
 */
export function fillCheckbox(
  element: HTMLInputElement,
  checked: boolean
): FillResult {
  const fieldName = element.name || element.id || 'unknown'

  scrollIntoView(element)
  element.checked = checked
  element.dispatchEvent(new Event('change', { bubbles: true }))

  return {
    ok: true,
    field: fieldName,
    filled: true
  }
}

/**
 * Fill any field based on type
 */
export function fillField(
  element: HTMLElement,
  value: string | boolean,
  force: boolean = false
): FillResult {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'text' || element.type === 'email' || element.type === 'tel' || element.type === 'url') {
      return fillText(element, String(value), force)
    }
    if (element.type === 'checkbox') {
      return fillCheckbox(element, Boolean(value))
    }
    if (element.type === 'radio') {
      return fillRadio(element.name, String(value))
    }
  }

  if (element instanceof HTMLTextAreaElement) {
    return fillText(element, String(value), force)
  }

  if (element instanceof HTMLSelectElement) {
    return fillSelect(element, String(value), force)
  }

  return {
    ok: false,
    field: 'unknown',
    filled: false,
    message: 'Unsupported element type'
  }
}
