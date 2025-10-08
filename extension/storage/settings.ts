/**
 * Settings management with chrome.storage.local wrapper
 */

import { Settings, DEFAULT_SETTINGS, RunRecord } from './schema';

const SETTINGS_KEY = 'jobpilot_settings';
const RUNS_KEY = 'jobpilot_runs';

export class SettingsManager {
  private static instance: SettingsManager;
  private listeners: Array<(settings: Settings) => void> = [];

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  async get(): Promise<Settings> {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
  }

  async set(settings: Partial<Settings>): Promise<void> {
    const current = await this.get();
    const updated = { ...current, ...settings };
    await chrome.storage.local.set({ [SETTINGS_KEY]: updated });
    this.notifyListeners(updated);
  }

  async update(updater: (current: Settings) => Partial<Settings>): Promise<void> {
    const current = await this.get();
    const updates = updater(current);
    await this.set(updates);
  }

  onChange(listener: (settings: Settings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(settings: Settings): void {
    this.listeners.forEach((listener) => listener(settings));
  }

  async getRuns(): Promise<RunRecord[]> {
    const result = await chrome.storage.local.get(RUNS_KEY);
    return result[RUNS_KEY] || [];
  }

  async addRun(run: RunRecord): Promise<void> {
    const runs = await this.getRuns();
    runs.unshift(run);
    // Keep last 100 runs
    if (runs.length > 100) {
      runs.splice(100);
    }
    await chrome.storage.local.set({ [RUNS_KEY]: runs });
  }

  async clearRuns(): Promise<void> {
    await chrome.storage.local.set({ [RUNS_KEY]: [] });
  }
}

// Initialize storage change listener
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[SETTINGS_KEY]) {
    const settings = { ...DEFAULT_SETTINGS, ...changes[SETTINGS_KEY].newValue };
    SettingsManager.getInstance()['notifyListeners'](settings);
  }
});
