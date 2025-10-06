/**
 * Guided overlay for file attachment
 */

import { t } from './i18n'

export interface OverlayOptions {
  targetElement: HTMLElement
  locale?: 'en' | 'tr'
  onContinue: () => void
  onSkip: () => void
}

export function showGuidedOverlay(options: OverlayOptions): () => void {
  const locale = options.locale || 'en'

  // Create overlay container
  const overlay = document.createElement('div')
  overlay.id = 'jobpilot-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-labelledby', 'jobpilot-overlay-title')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
  `

  // Create dialog
  const dialog = document.createElement('div')
  dialog.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `

  // Title
  const title = document.createElement('h2')
  title.id = 'jobpilot-overlay-title'
  title.textContent = t('overlay_title', locale)
  title.style.cssText = `
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: bold;
    color: #1a202c;
  `

  // Body
  const body = document.createElement('p')
  body.textContent = t('overlay_body', locale)
  body.style.cssText = `
    margin: 0 0 24px 0;
    color: #4a5568;
    line-height: 1.5;
  `

  // Buttons
  const buttonContainer = document.createElement('div')
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  `

  const continueBtn = document.createElement('button')
  continueBtn.textContent = t('continue', locale)
  continueBtn.style.cssText = `
    padding: 8px 16px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `
  continueBtn.addEventListener('click', () => {
    destroy()
    options.onContinue()
  })

  const skipBtn = document.createElement('button')
  skipBtn.textContent = t('skip', locale)
  skipBtn.style.cssText = `
    padding: 8px 16px;
    background: #e2e8f0;
    color: #1a202c;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `
  skipBtn.addEventListener('click', () => {
    destroy()
    options.onSkip()
  })

  buttonContainer.appendChild(skipBtn)
  buttonContainer.appendChild(continueBtn)

  dialog.appendChild(title)
  dialog.appendChild(body)
  dialog.appendChild(buttonContainer)
  overlay.appendChild(dialog)

  // Highlight target element
  const targetRect = options.targetElement.getBoundingClientRect()
  const highlight = document.createElement('div')
  highlight.style.cssText = `
    position: fixed;
    top: ${targetRect.top - 4}px;
    left: ${targetRect.left - 4}px;
    width: ${targetRect.width + 8}px;
    height: ${targetRect.height + 8}px;
    border: 3px solid #3182ce;
    border-radius: 4px;
    box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.2);
    z-index: 1000000;
    pointer-events: none;
  `
  document.body.appendChild(highlight)

  // Live region for screen readers
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('role', 'status')
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  liveRegion.textContent = t('overlay_body', locale)
  overlay.appendChild(liveRegion)

  // Append to DOM
  document.body.appendChild(overlay)

  // Focus trap
  const focusableElements = overlay.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  const handleTab = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  }

  overlay.addEventListener('keydown', handleTab)
  firstFocusable?.focus()

  // ESC to close
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      destroy()
      options.onSkip()
    }
  }
  document.addEventListener('keydown', handleEsc)

  function destroy() {
    overlay.remove()
    highlight.remove()
    document.removeEventListener('keydown', handleEsc)
  }

  return destroy
}
