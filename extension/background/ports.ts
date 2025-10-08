/**
 * Tab and port lifecycle management
 */

import { ContentCommand, ContentResponse } from '../messaging/protocol';

type PortConnection = {
  port: chrome.runtime.Port;
  tabId: number;
  requestId: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

export class PortManager {
  private connections = new Map<string, PortConnection>();
  private tabPorts = new Map<number, chrome.runtime.Port>();

  /**
   * Create or get existing port for tab
   */
  async getTabPort(tabId: number): Promise<chrome.runtime.Port | null> {
    const existing = this.tabPorts.get(tabId);
    if (existing) {
      return existing;
    }

    // Wait for content script to connect
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000);

      const listener = (port: chrome.runtime.Port) => {
        if (port.name === 'content-script' && port.sender?.tab?.id === tabId) {
          clearTimeout(timeout);
          chrome.runtime.onConnect.removeListener(listener);
          this.tabPorts.set(tabId, port);

          port.onDisconnect.addListener(() => {
            this.tabPorts.delete(tabId);
          });

          resolve(port);
        }
      };

      chrome.runtime.onConnect.addListener(listener);
    });
  }

  /**
   * Send command to content script and wait for response
   */
  async sendCommand(tabId: number, command: ContentCommand): Promise<ContentResponse> {
    return new Promise(async (resolve, reject) => {
      const port = await this.getTabPort(tabId);
      if (!port) {
        return reject(new Error('Failed to connect to content script'));
      }

      const requestId = command.meta.requestId;
      const timeout = setTimeout(() => {
        this.connections.delete(requestId);
        reject(new Error('Command timeout'));
      }, 30000);

      this.connections.set(requestId, {
        port,
        tabId,
        requestId,
        resolve: (response) => {
          clearTimeout(timeout);
          this.connections.delete(requestId);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timeout);
          this.connections.delete(requestId);
          reject(error);
        },
      });

      port.postMessage(command);
    });
  }

  /**
   * Handle response from content script
   */
  handleResponse(response: ContentResponse): void {
    const connection = this.connections.get(response.meta.requestId);
    if (connection) {
      if (response.type === 'ERROR') {
        connection.reject(new Error(response.payload.message || 'Unknown error'));
      } else {
        connection.resolve(response);
      }
    }
  }

  /**
   * Open or activate tab with URL
   */
  async openTab(url: string): Promise<number> {
    // Check for existing tab with URL
    const tabs = await chrome.tabs.query({ url });
    if (tabs.length > 0 && tabs[0].id) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      return tabs[0].id;
    }

    // Create new tab
    const tab = await chrome.tabs.create({ url, active: true });
    if (!tab.id) {
      throw new Error('Failed to create tab');
    }

    return tab.id;
  }

  /**
   * Inject content script into tab
   */
  async injectScript(tabId: number, file: string): Promise<void> {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [file],
    });
  }

  /**
   * Wait for tab to finish loading
   */
  async waitForTabReady(tabId: number, timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('Tab load timeout'));
      }, timeout);

      const listener = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
        if (updatedTabId === tabId && info.status === 'complete') {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };

      chrome.tabs.onUpdated.addListener(listener);

      // Check if already loaded
      chrome.tabs.get(tabId).then((tab) => {
        if (tab.status === 'complete') {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });
  }
}
