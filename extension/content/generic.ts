/**
 * Generic content script (fallback for unsupported platforms)
 */

import { DOMHelper } from './shared/dom';
import { AutoFiller, FieldMapping } from './shared/autofill';
import { GuidedOverlay } from './shared/overlay';
import { PageParser } from './shared/parse';
import { ContentCommand, ContentResponse } from '../messaging/protocol';

class GenericHandler {
  private autofiller = new AutoFiller();
  private overlay = new GuidedOverlay();
  private port: chrome.runtime.Port | null = null;

  async init() {
    this.port = chrome.runtime.connect({ name: 'content-script' });

    this.port.onMessage.addListener((command: ContentCommand) => {
      this.handleCommand(command);
    });

    console.log('Generic handler initialized');
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
      await DOMHelper.waitForIdle();

      // Use pure heuristics for field matching
      const mappings = this.buildFieldMappings(answers || {});
      const filled = await this.autofiller.fillFields(mappings);
      this.log(requestId, `Filled ${filled} fields using generic heuristics`);

      // Try to find any file input
      if (files && files.length > 0) {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        if (fileInputs.length > 0) {
          const resumeInput = fileInputs[0] as HTMLInputElement;
          await this.overlay.showFileAttachment(resumeInput, locale);
        }
      }

      if (dryRun) {
        await this.overlay.showDryRun(locale);
        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: true,
            reviewNeeded: true,
            message: 'Generic dry-run complete. Please review carefully.',
            hints: this.autofiller.getLogs(),
          },
          meta: { requestId },
        });
        return;
      }

      const submitBtn = DOMHelper.findSubmitButton();
      if (submitBtn) {
        submitBtn.click();
        this.log(requestId, 'Clicked submit button (generic)');

        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: true,
            submitted: true,
            message: 'Generic application submitted',
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
            message: 'Submit button not found. Manual submission required.',
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
      const job = PageParser.parse('generic');

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

    // Common field synonyms
    const synonyms: Record<string, string[]> = {
      email: ['email', 'e-mail', 'e mail'],
      phone: ['phone', 'telephone', 'mobile', 'cell'],
      name: ['name', 'full name', 'your name'],
      firstName: ['first name', 'given name'],
      lastName: ['last name', 'surname', 'family name'],
    };

    for (const [key, value] of Object.entries(answers)) {
      if (!value) continue;

      // Check if key matches any synonym
      const matchedSynonyms = synonyms[key] || [key];

      for (const synonym of matchedSynonyms) {
        mappings.push({
          label: synonym,
          placeholder: synonym,
          value,
        });
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
    console.log(`[Generic] ${message}`);
    if (this.port) {
      this.port.postMessage({
        type: 'LOG',
        payload: { message },
        meta: { requestId },
      });
    }
  }
}

const handler = new GenericHandler();
handler.init();
