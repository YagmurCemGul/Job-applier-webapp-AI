/**
 * DOM utilities for finding and interacting with form elements
 */

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector)
    if (el) {
      resolve(el)
      return
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Timeout waiting for ${selector}`))
    }, timeout)
  })
}

/**
 * Wait for network idle
 */
export function waitForIdle(timeout: number = 2000): Promise<void> {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => resolve(), { timeout })
    } else {
      setTimeout(resolve, timeout)
    }
  })
}

/**
 * Find input by label text
 */
export function findByLabel(labelText: string): HTMLElement | null {
  const normalizedText = normalizeText(labelText)

  // Try label[for] → input
  const labels = Array.from(document.querySelectorAll('label'))
  for (const label of labels) {
    if (normalizeText(label.textContent || '').includes(normalizedText)) {
      const forAttr = label.getAttribute('for')
      if (forAttr) {
        const input = document.getElementById(forAttr)
        if (input) return input
      }

      // Try closest input
      const input = label.querySelector('input, textarea, select')
      if (input) return input as HTMLElement
    }
  }

  // Try aria-label
  const byAria = document.querySelector(`[aria-label*="${labelText}" i]`)
  if (byAria) return byAria as HTMLElement

  // Try placeholder
  const byPlaceholder = document.querySelector(`[placeholder*="${labelText}" i]`)
  if (byPlaceholder) return byPlaceholder as HTMLElement

  return null
}

/**
 * Find input by name attribute
 */
export function findByName(name: string): HTMLElement | null {
  return document.querySelector(`[name="${name}"]`)
}

/**
 * Find input by id
 */
export function findById(id: string): HTMLElement | null {
  return document.getElementById(id)
}

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
}

/**
 * Find submit button
 */
export function findSubmitButton(): HTMLElement | null {
  // Try type=submit
  const typeSubmit = document.querySelector('button[type="submit"]')
  if (typeSubmit) return typeSubmit as HTMLElement

  // Try data-qa submit
  const dataQa = document.querySelector('[data-qa*="submit" i]')
  if (dataQa) return dataQa as HTMLElement

  // Try button text
  const buttons = Array.from(document.querySelectorAll('button'))
  for (const btn of buttons) {
    const text = normalizeText(btn.textContent || '')
    if (
      text.includes('submit') ||
      text.includes('apply') ||
      text.includes('continue') ||
      text.includes('next')
    ) {
      return btn
    }
  }

  return null
}

/**
 * Check if element is visible
 */
export function isVisible(el: HTMLElement): boolean {
  if (!el.offsetParent && el.tagName !== 'BODY') return false
  const style = window.getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

/**
 * Scroll element into view
 */
export function scrollIntoView(el: HTMLElement): void {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
