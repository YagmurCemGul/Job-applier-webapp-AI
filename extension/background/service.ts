/**
 * Background service worker entry point
 */

import { SecurityValidator } from './security';
import { RateLimiter } from './rateLimit';
import { MessageRouter } from './router';
import { PortManager } from './ports';
import { SettingsManager } from '../storage/settings';
import {
  ExtensionMessage,
  ApplyStartMsg,
  ApplyResultMsg,
  ImportJobMsg,
  PingMsg,
  ContentCommand,
  ContentResponse,
} from '../messaging/protocol';
import { DomainKey, RunRecord } from '../storage/schema';

const security = new SecurityValidator();
const rateLimiter = new RateLimiter();
const router = new MessageRouter();
const portManager = new PortManager();
const settings = SettingsManager.getInstance();

// Handle messages from web app
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch((error) => {
    sendResponse({ type: 'ERROR', payload: { message: error.message } });
  });
  return true; // Keep channel open for async response
});

// Handle port connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'content-script') {
    port.onMessage.addListener((response: ContentResponse) => {
      portManager.handleResponse(response);
    });
  }
});

async function handleMessage(message: ExtensionMessage, sender: chrome.runtime.MessageSender): Promise<any> {
  const currentSettings = await settings.get();

  // Check if extension is paused
  if (currentSettings.paused && message.type !== 'PING') {
    return {
      type: 'ERROR',
      payload: { message: 'Extension is paused' },
      meta: { ts: Date.now() },
    };
  }

  switch (message.type) {
    case 'PING':
      return handlePing(message as PingMsg);

    case 'APPLY_START':
      return handleApplyStart(message as ApplyStartMsg);

    case 'IMPORT_JOB':
      // Forward to web app (if listening)
      return { type: 'ACK', meta: { ts: Date.now() } };

    default:
      return {
        type: 'ERROR',
        payload: { message: 'Unknown message type' },
        meta: { ts: Date.now() },
      };
  }
}

async function handlePing(message: PingMsg): Promise<any> {
  // Validate security
  const validation = await security.validateMessage(message);
  if (!validation.valid) {
    return {
      type: 'ERROR',
      payload: { message: validation.error },
      meta: { ts: Date.now() },
    };
  }

  return {
    type: 'PONG',
    meta: { ts: Date.now() },
  };
}

async function handleApplyStart(message: ApplyStartMsg): Promise<ApplyResultMsg> {
  const requestId = message.meta.requestId;
  const { jobUrl, platform, files, answers, dryRun, locale } = message.payload;

  try {
    // Validate security
    const validation = await security.validateMessage(message);
    if (!validation.valid) {
      return createErrorResult(requestId, validation.error || 'Unauthorized');
    }

    // Validate platform matches URL
    if (!router.validatePlatform(jobUrl, platform)) {
      return createErrorResult(requestId, `Platform ${platform} does not match URL ${jobUrl}`);
    }

    // Get settings for this platform
    const currentSettings = await settings.get();
    const isLegalEnabled = currentSettings.legal[platform] ?? false;
    const isEnabled = currentSettings.enabled[platform] ?? false;
    const rateLimit = currentSettings.rateLimit[platform] ?? 10;
    const defaultDryRun = currentSettings.dryRunDefault[platform] ?? true;
    const effectiveDryRun = dryRun ?? defaultDryRun;

    // Check if platform is enabled
    if (!isEnabled) {
      return createErrorResult(requestId, `Platform ${platform} is disabled in settings`);
    }

    // Check legal mode
    if (!isLegalEnabled) {
      return createErrorResult(
        requestId,
        `Legal Mode is OFF for ${platform}. Enable it in Options to proceed.`
      );
    }

    // Check rate limit
    const rateLimitCheck = await rateLimiter.checkLimit(platform, rateLimit);
    if (!rateLimitCheck.allowed) {
      return createErrorResult(
        requestId,
        `Rate limit exceeded. Retry after ${Math.ceil((rateLimitCheck.retryAfter || 0) / 1000)}s`
      );
    }

    // Open tab with job URL
    const tabId = await portManager.openTab(jobUrl);

    // Wait for tab to load
    await portManager.waitForTabReady(tabId);

    // Inject script if needed (for generic platform)
    if (router.requiresInjection(jobUrl, platform)) {
      const scriptFile = router.getContentScriptForPlatform(platform);
      await portManager.injectScript(tabId, scriptFile);
    }

    // Wait a bit for content script to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send apply command to content script
    const command: ContentCommand = {
      type: 'RUN_APPLY',
      payload: { files, answers, dryRun: effectiveDryRun, locale: locale || currentSettings.language },
      meta: { requestId },
    };

    const response = await portManager.sendCommand(tabId, command);

    // Record run
    const run: RunRecord = {
      id: requestId,
      domain: platform,
      url: jobUrl,
      timestamp: Date.now(),
      status: response.payload.ok ? 'success' : 'error',
      message: response.payload.message,
      dryRun: effectiveDryRun,
    };
    await settings.addRun(run);

    // Return result
    return {
      type: 'APPLY_RESULT',
      payload: response.payload,
      meta: { requestId, ts: Date.now() },
    };
  } catch (error: any) {
    // Record error
    const run: RunRecord = {
      id: requestId,
      domain: platform,
      url: jobUrl,
      timestamp: Date.now(),
      status: 'error',
      message: error.message,
      dryRun: dryRun ?? true,
    };
    await settings.addRun(run);

    return createErrorResult(requestId, error.message);
  }
}

function createErrorResult(requestId: string, message: string): ApplyResultMsg {
  return {
    type: 'APPLY_RESULT',
    payload: { ok: false, message },
    meta: { requestId, ts: Date.now() },
  };
}

// Install/update handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('ui/options.html') });
  }
});

console.log('JobPilot Extension: Background service worker initialized');
