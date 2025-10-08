/**
 * Popup UI for extension
 */

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsManager } from '../storage/settings';
import { RunRecord } from '../storage/schema';

const Popup: React.FC = () => {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [paused, setPaused] = useState(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);

  const settings = SettingsManager.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [settingsData, runsData, tabs] = await Promise.all([
      settings.get(),
      settings.getRuns(),
      chrome.tabs.query({ active: true, currentWindow: true }),
    ]);

    setPaused(settingsData.paused);
    setRuns(runsData.slice(0, 10));
    setCurrentTab(tabs[0] || null);
  };

  const togglePause = async () => {
    await settings.set({ paused: !paused });
    setPaused(!paused);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const clearHistory = async () => {
    await settings.clearRuns();
    setRuns([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'review':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'review':
        return '⚠';
      default:
        return '•';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>JobPilot</h1>
        <button
          onClick={togglePause}
          className={`pause-btn ${paused ? 'paused' : ''}`}
          title={paused ? 'Resume' : 'Pause'}
        >
          {paused ? '▶' : '⏸'}
        </button>
      </header>

      <div className="popup-content">
        <div className="section">
          <h2>Recent Runs</h2>
          {runs.length === 0 ? (
            <p className="empty-state">No recent activity</p>
          ) : (
            <div className="runs-list">
              {runs.map((run) => (
                <div key={run.id} className="run-item">
                  <div className="run-status">
                    <span className={`status-icon ${getStatusColor(run.status)}`}>
                      {getStatusIcon(run.status)}
                    </span>
                  </div>
                  <div className="run-details">
                    <div className="run-domain">{run.domain}</div>
                    <div className="run-time">{formatTime(run.timestamp)}</div>
                    {run.dryRun && <span className="run-badge">Dry-Run</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="popup-actions">
          {runs.length > 0 && (
            <button onClick={clearHistory} className="btn-secondary">
              Clear History
            </button>
          )}
          <button onClick={openOptions} className="btn-primary">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Popup />);
}
