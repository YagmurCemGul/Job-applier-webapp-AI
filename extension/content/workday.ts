/**
 * Workday content script
 */

import { DOMHelper } from './shared/dom';
import { AutoFiller, FieldMapping } from './shared/autofill';
import { GuidedOverlay } from './shared/overlay';
import { PageParser } from './shared/parse';
import { ContentCommand, ContentResponse } from '../messaging/protocol';

class WorkdayHandler {
  private autofiller = new AutoFiller();
  private overlay = new GuidedOverlay();
  private port: chrome.runtime.Port | null = null;

  async init() {
    this.port = chrome.runtime.connect({ name: 'content-script' });

    this.port.onMessage.addListener((command: ContentCommand) => {
      this.handleCommand(command);
    });

    console.log('Workday handler initialized');
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
      // Workday has dynamic components, wait longer
      await DOMHelper.waitForIdle(5000);

      // Use aria-label based matching for Workday
      const mappings = this.buildFieldMappings(answers || {});
      const filled = await this.autofiller.fillFields(mappings);
      this.log(requestId, `Filled ${filled} fields in Workday form`);

      // Handle file upload (Workday uses data-automation-id)
      if (files && files.length > 0) {
        const resumeInput = document.querySelector(
          'input[type="file"][data-automation-id*="resume"]'
        ) as HTMLInputElement;
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
            message: 'Dry-run complete for Workday',
            hints: this.autofiller.getLogs(),
          },
          meta: { requestId },
        });
        return;
      }

      // Find submit button (Workday uses specific data attributes)
      const submitBtn =
        (document.querySelector('[data-automation-id="bottom-navigation-next-button"]') as HTMLButtonElement) ||
        DOMHelper.findSubmitButton();

      if (submitBtn) {
        submitBtn.click();
        this.log(requestId, 'Clicked Workday submit button');

        this.sendResponse(requestId, {
          type: 'APPLY_COMPLETE',
          payload: {
            ok: true,
            submitted: true,
            message: 'Workday application submitted',
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
            message: 'Workday submit button not found',
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
      const job = PageParser.parse('workday');

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

    // Workday typically uses aria-label and data-automation-id
    for (const [key, value] of Object.entries(answers)) {
      if (value) {
        mappings.push({
          ariaLabel: key,
          label: key,
          value,
        } as FieldMapping);
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
    console.log(`[Workday] ${message}`);
    if (this.port) {
      this.port.postMessage({
        type: 'LOG',
        payload: { message },
        meta: { requestId },
      });
    }
  }
}

const handler = new WorkdayHandler();
handler.init();
