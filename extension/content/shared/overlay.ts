/**
 * Guided overlay for file attachment and user instructions
 */

import { DOMHelper } from './dom';
import { t } from './i18n';

type OverlayOptions = {
  title: string;
  body: string;
  targetElement?: HTMLElement;
  continueText?: string;
  skipText?: string;
  locale?: 'en' | 'tr';
};

export class GuidedOverlay {
  private overlay: HTMLDivElement | null = null;
  private resolve: ((skipped: boolean) => void) | null = null;

  /**
   * Show overlay with instructions
   */
  async show(options: OverlayOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.createOverlay(options);
    });
  }

  /**
   * Show file attachment overlay
   */
  async showFileAttachment(fileInput: HTMLInputElement, locale: 'en' | 'tr' = 'en'): Promise<boolean> {
    // Highlight the file input
    DOMHelper.scrollIntoView(fileInput);
    DOMHelper.highlight(fileInput, 5000);

    return this.show({
      title: t('overlay_title', locale),
      body: t('overlay_body', locale),
      targetElement: fileInput,
      continueText: t('overlay_continue', locale),
      skipText: t('overlay_skip', locale),
      locale,
    });
  }

  /**
   * Show dry-run notification
   */
  async showDryRun(locale: 'en' | 'tr' = 'en'): Promise<void> {
    const banner = this.createBanner({
      title: t('dry_run_title', locale),
      body: t('dry_run_body', locale),
      type: 'info',
    });

    document.body.appendChild(banner);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      banner.remove();
    }, 5000);
  }

  /**
   * Show legal mode warning
   */
  showLegalWarning(locale: 'en' | 'tr' = 'en'): void {
    const banner = this.createBanner({
      title: t('error', locale),
      body: t('legal_off', locale),
      type: 'error',
    });

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.remove();
    }, 10000);
  }

  /**
   * Create overlay UI
   */
  private createOverlay(options: OverlayOptions): void {
    // Create backdrop
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-labelledby', 'overlay-title');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 480px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    `;

    // Title
    const title = document.createElement('h2');
    title.id = 'overlay-title';
    title.textContent = options.title;
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    `;

    // Body
    const body = document.createElement('p');
    body.textContent = options.body;
    body.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    `;

    // Live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.textContent = options.body;
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    `;

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    if (options.skipText) {
      const skipBtn = this.createButton(options.skipText, 'secondary');
      skipBtn.addEventListener('click', () => this.close(true));
      buttonContainer.appendChild(skipBtn);
    }

    const continueBtn = this.createButton(options.continueText || 'Continue', 'primary');
    continueBtn.addEventListener('click', () => this.close(false));
    buttonContainer.appendChild(continueBtn);

    dialog.appendChild(title);
    dialog.appendChild(body);
    dialog.appendChild(liveRegion);
    dialog.appendChild(buttonContainer);

    this.overlay.appendChild(dialog);
    document.body.appendChild(this.overlay);

    // Focus trap
    continueBtn.focus();

    // ESC to close
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close(true);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  /**
   * Create banner notification
   */
  private createBanner(options: { title: string; body: string; type: 'info' | 'error' }): HTMLDivElement {
    const banner = document.createElement('div');
    banner.setAttribute('role', 'alert');
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: ${options.type === 'error' ? '#fee2e2' : '#dbeafe'};
      border-left: 4px solid ${options.type === 'error' ? '#dc2626' : '#3b82f6'};
      border-radius: 4px;
      padding: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      color: ${options.type === 'error' ? '#991b1b' : '#1e40af'};
      margin-bottom: 4px;
    `;
    title.textContent = options.title;

    const body = document.createElement('div');
    body.style.cssText = `
      font-size: 13px;
      color: ${options.type === 'error' ? '#7f1d1d' : '#1e3a8a'};
    `;
    body.textContent = options.body;

    banner.appendChild(title);
    banner.appendChild(body);

    return banner;
  }

  /**
   * Create button
   */
  private createButton(text: string, variant: 'primary' | 'secondary'): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      ${
        variant === 'primary'
          ? `
        background: #3b82f6;
        color: white;
        border: none;
      `
          : `
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      `
      }
    `;

    button.addEventListener('mouseenter', () => {
      if (variant === 'primary') {
        button.style.background = '#2563eb';
      } else {
        button.style.background = '#f9fafb';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (variant === 'primary') {
        button.style.background = '#3b82f6';
      } else {
        button.style.background = 'white';
      }
    });

    return button;
  }

  /**
   * Close overlay
   */
  private close(skipped: boolean): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.resolve) {
      this.resolve(skipped);
      this.resolve = null;
    }
  }
}
