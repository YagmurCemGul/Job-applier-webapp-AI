/**
 * DOM utilities for finding and interacting with form elements
 */

export class DOMHelper {
  /**
   * Wait for element to appear in DOM
   */
  static async waitForElement(
    selector: string,
    timeout = 5000,
    root: Document | Element = document
  ): Promise<Element | null> {
    const existing = root.querySelector(selector);
    if (existing) return existing;

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);

      const observer = new MutationObserver(() => {
        const element = root.querySelector(selector);
        if (element) {
          clearTimeout(timer);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(root instanceof Document ? root.body : root, {
        childList: true,
        subtree: true,
      });
    });
  }

  /**
   * Wait for page to be idle (network and DOM)
   */
  static async waitForIdle(timeout = 3000): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(), { timeout });
      } else {
        setTimeout(resolve, Math.min(timeout, 1000));
      }
    });
  }

  /**
   * Find input by label text
   */
  static findByLabel(labelText: string, root: Document | Element = document): HTMLElement | null {
    const normalizedLabel = this.normalizeText(labelText);

    // Try label[for] association
    const labels = Array.from(root.querySelectorAll('label'));
    for (const label of labels) {
      if (this.normalizeText(label.textContent || '').includes(normalizedLabel)) {
        const forAttr = label.getAttribute('for');
        if (forAttr) {
          const input = root.querySelector(`#${forAttr}`);
          if (input) return input as HTMLElement;
        }

        // Check if input is inside label
        const nestedInput = label.querySelector('input, select, textarea');
        if (nestedInput) return nestedInput as HTMLElement;
      }
    }

    // Try aria-label
    const ariaElement = root.querySelector(`[aria-label*="${labelText}" i]`);
    if (ariaElement) return ariaElement as HTMLElement;

    // Try placeholder
    const placeholderElement = root.querySelector(`[placeholder*="${labelText}" i]`);
    if (placeholderElement) return placeholderElement as HTMLElement;

    return null;
  }

  /**
   * Find input by multiple strategies
   */
  static findInput(options: {
    id?: string;
    name?: string;
    label?: string;
    placeholder?: string;
    ariaLabel?: string;
    type?: string;
    root?: Document | Element;
  }): HTMLElement | null {
    const root = options.root || document;

    // Try ID first (most specific)
    if (options.id) {
      const element = root.querySelector(`#${options.id}`);
      if (element) return element as HTMLElement;
    }

    // Try name
    if (options.name) {
      const element = root.querySelector(`[name="${options.name}"]`);
      if (element) return element as HTMLElement;
    }

    // Try label
    if (options.label) {
      const element = this.findByLabel(options.label, root);
      if (element) return element;
    }

    // Try aria-label
    if (options.ariaLabel) {
      const element = root.querySelector(`[aria-label="${options.ariaLabel}"]`);
      if (element) return element as HTMLElement;
    }

    // Try placeholder
    if (options.placeholder) {
      const element = root.querySelector(`[placeholder="${options.placeholder}"]`);
      if (element) return element as HTMLElement;
    }

    // Try type-based fallback
    if (options.type) {
      const element = root.querySelector(`input[type="${options.type}"]`);
      if (element) return element as HTMLElement;
    }

    return null;
  }

  /**
   * Normalize text for comparison
   */
  static normalizeText(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if element is visible
   */
  static isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetParent !== null
    );
  }

  /**
   * Scroll element into view
   */
  static scrollIntoView(element: HTMLElement): void {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Highlight element visually
   */
  static highlight(element: HTMLElement, duration = 2000): void {
    const originalOutline = element.style.outline;
    const originalOutlineOffset = element.style.outlineOffset;

    element.style.outline = '3px solid #3b82f6';
    element.style.outlineOffset = '2px';

    setTimeout(() => {
      element.style.outline = originalOutline;
      element.style.outlineOffset = originalOutlineOffset;
    }, duration);
  }

  /**
   * Find submit button
   */
  static findSubmitButton(root: Document | Element = document): HTMLButtonElement | null {
    // Try explicit submit buttons
    const submitBtn = root.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) return submitBtn;

    // Try common data attributes
    const dataSubmit = root.querySelector('[data-qa="submit"], [data-test="submit"]') as HTMLButtonElement;
    if (dataSubmit) return dataSubmit;

    // Try button text
    const buttons = Array.from(root.querySelectorAll('button'));
    const submitTexts = ['submit', 'apply', 'send', 'continue', 'next', 'gönder', 'başvur'];

    for (const button of buttons) {
      const text = this.normalizeText(button.textContent || '');
      if (submitTexts.some((t) => text.includes(t))) {
        return button as HTMLButtonElement;
      }
    }

    return null;
  }

  /**
   * Dispatch input events
   */
  static dispatchEvents(element: HTMLElement, value?: any): void {
    // Focus
    element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    // Input
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Change
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // Blur
    element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
  }
}
