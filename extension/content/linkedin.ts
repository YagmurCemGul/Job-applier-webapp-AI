/**
 * LinkedIn content script
 */

import { DOMHelper } from './shared/dom';
import { AutoFiller, FieldMapping } from './shared/autofill';
import { GuidedOverlay } from './shared/overlay';
import { PageParser } from './shared/parse';
import { ContentCommand, ContentResponse } from '../messaging/protocol';

class LinkedInHandler {
  private autofiller = new AutoFiller();
  private overlay = new GuidedOverlay();
  private port: chrome.runtime.Port | null = null;

  async init() {
    this.port = chrome.runtime.connect({ name: 'content-script' });

    this.port.onMessage.addListener((command: ContentCommand) => {
      this.handleCommand(command);
    });

    console.log('LinkedIn handler initialized');
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

      const mappings = this.buildFieldMappings(answers || {});
      const filled = await this.autofiller.fillFields(mappings);
      this.log(requestId, `Filled ${filled} fields on LinkedIn`);

      // LinkedIn file upload
      if (files && files.length > 0) {
        const resumeInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (resumeInput) {
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
            message: 'LinkedIn dry-run complete',
            hints: this.autofiller.getLogs(),
          },
          meta: { requestId },
        });
        return;
      }

      const submitBtn = DOMHelper.findSubmitButton();
      if (submitBtn) {
        submitBtn.click();
        this.log(requestId, 'Clicked LinkedIn submit');

        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: true,
            submitted: true,
            message: 'LinkedIn application submitted',
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
            message: 'LinkedIn submit button not found',
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
      const job = PageParser.parse('linkedin');

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

    for (const [key, value] of Object.entries(answers)) {
      if (value) {
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
    console.log(`[LinkedIn] ${message}`);
    if (this.port) {
      this.port.postMessage({
        type: 'LOG',
        payload: { message },
        meta: { requestId },
      });
    }
  }
}

const handler = new LinkedInHandler();
handler.init();
