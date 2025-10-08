/**
 * Greenhouse content script
 */

import { DOMHelper } from './shared/dom';
import { AutoFiller, FieldMapping } from './shared/autofill';
import { GuidedOverlay } from './shared/overlay';
import { PageParser } from './shared/parse';
import { ContentCommand, ContentResponse } from '../messaging/protocol';

class GreenhouseHandler {
  private autofiller = new AutoFiller();
  private overlay = new GuidedOverlay();
  private port: chrome.runtime.Port | null = null;

  async init() {
    // Connect to background
    this.port = chrome.runtime.connect({ name: 'content-script' });

    // Listen for commands
    this.port.onMessage.addListener((command: ContentCommand) => {
      this.handleCommand(command);
    });

    console.log('Greenhouse handler initialized');
  }

  private async handleCommand(command: ContentCommand) {
    switch (command.type) {
      case 'RUN_APPLY':
        await this.runApply(command);
        break;
      case 'PARSE_PAGE':
        await this.parsePage(command);
        break;
      default:
        this.sendResponse(command.meta.requestId, {
          type: 'ERROR',
          payload: { message: 'Unknown command' },
          meta: { requestId: command.meta.requestId },
        });
    }
  }

  private async runApply(command: ContentCommand) {
    const { files, answers, dryRun, locale } = command.payload;
    const requestId = command.meta.requestId;

    try {
      // Wait for form to be ready
      await DOMHelper.waitForIdle();

      // Build field mappings from answers
      const mappings = this.buildFieldMappings(answers || {});

      // Fill fields
      const filled = await this.autofiller.fillFields(mappings);
      this.log(requestId, `Filled ${filled} fields`);

      // Handle file attachments
      if (files && files.length > 0) {
        const resumeInput = document.querySelector('input[type="file"][name*="resume"]') as HTMLInputElement;
        if (resumeInput) {
          const skipped = await this.overlay.showFileAttachment(resumeInput, locale);
          if (!skipped) {
            this.log(requestId, 'User instructed to attach file');
          } else {
            this.log(requestId, 'User skipped file attachment');
          }
        }
      }

      // Dry run check
      if (dryRun) {
        await this.overlay.showDryRun(locale);
        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: true,
            reviewNeeded: true,
            message: 'Dry-run complete. Form filled for review.',
            hints: this.autofiller.getLogs(),
          },
          meta: { requestId },
        });
        return;
      }

      // Find and click submit button
      const submitBtn = DOMHelper.findSubmitButton();
      if (submitBtn) {
        submitBtn.click();
        this.log(requestId, 'Clicked submit button');

        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: true,
            submitted: true,
            message: 'Application submitted',
            url: window.location.href,
            hints: this.autofiller.getLogs(),
          },
          meta: { requestId },
        });
      } else {
        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: false,
            reviewNeeded: true,
            message: 'Submit button not found. Manual review needed.',
            hints: this.autofiller.getLogs(),
          },
          meta: { requestId },
        });
      }
    } catch (error: any) {
      this.sendResponse(requestId, {
        type: 'ERROR',
        payload: { message: error.message },
        meta: { requestId },
      });
    }
  }

  private async parsePage(command: ContentCommand) {
    const requestId = command.meta.requestId;

    try {
      const job = PageParser.parse('greenhouse');

      this.sendResponse(requestId, {
        type: 'PARSE_COMPLETE',
        payload: job,
        meta: { requestId },
      });
    } catch (error: any) {
      this.sendResponse(requestId, {
        type: 'ERROR',
        payload: { message: error.message },
        meta: { requestId },
      });
    }
  }

  private buildFieldMappings(answers: Record<string, any>): FieldMapping[] {
    const mappings: FieldMapping[] = [];

    // Common Greenhouse fields
    const fieldMap: Record<string, { id?: string; name?: string; label?: string }> = {
      firstName: { id: 'first_name' },
      lastName: { id: 'last_name' },
      email: { id: 'email' },
      phone: { id: 'phone' },
      linkedIn: { label: 'LinkedIn' },
      github: { label: 'GitHub' },
      portfolio: { label: 'Portfolio' },
      resume: { name: 'resume' },
      coverLetter: { name: 'cover_letter' },
    };

    for (const [key, value] of Object.entries(answers)) {
      const field = fieldMap[key];
      if (field && value) {
        mappings.push({ ...field, value });
      } else if (value) {
        // Try label-based matching for custom questions
        mappings.push({ label: key, value });
      }
    }

    return mappings;
  }

  private sendResponse(requestId: string, response: ContentResponse) {
    if (this.port) {
      this.port.postMessage(response);
    }
  }

  private log(requestId: string, message: string) {
    console.log(`[Greenhouse] ${message}`);
    if (this.port) {
      this.port.postMessage({
        type: 'LOG',
        payload: { message },
        meta: { requestId },
      });
    }
  }
}

// Initialize
const handler = new GreenhouseHandler();
handler.init();
