/**
 * Options UI for extension
 */

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsManager } from '../storage/settings';
import { Settings, DomainKey } from '../storage/schema';

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [appOrigin, setAppOrigin] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [showHmacKey, setShowHmacKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const settingsManager = SettingsManager.getInstance();

  const domains: DomainKey[] = ['greenhouse', 'lever', 'workday', 'indeed', 'linkedin', 'generic'];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await settingsManager.get();
    setSettings(data);
    setHmacKey(data.hmacKey);
  };

  const saveSettings = async () => {
    if (!settings) return;

    await settingsManager.set({
      ...settings,
      hmacKey,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addOrigin = () => {
    if (!appOrigin || !settings) return;

    try {
      const url = new URL(appOrigin);
      if (!settings.appOrigins.includes(url.origin)) {
        setSettings({
          ...settings,
          appOrigins: [...settings.appOrigins, url.origin],
        });
      }
      setAppOrigin('');
    } catch {
      alert('Invalid URL');
    }
  };

  const removeOrigin = (origin: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      appOrigins: settings.appOrigins.filter((o) => o !== origin),
    });
  };

  const toggleDomain = (domain: DomainKey, field: 'legal' | 'enabled' | 'dryRunDefault') => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: {
        ...settings[field],
        [domain]: !settings[field][domain],
      },
    });
  };

  const updateRateLimit = (domain: DomainKey, value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      rateLimit: {
        ...settings.rateLimit,
        [domain]: value,
      },
    });
  };

  const testBridge = async () => {
    setTestResult('Testing...');

    try {
      const message = {
        type: 'PING',
        meta: {
          ts: Date.now(),
          origin: settings?.appOrigins[0] || window.location.origin,
        },
      };

      const response = await chrome.runtime.sendMessage(message);
      if (response.type === 'PONG') {
        setTestResult('✓ Bridge test successful');
      } else {
        setTestResult('✗ Unexpected response');
      }
    } catch (error: any) {
      setTestResult(`✗ Error: ${error.message}`);
    }

    setTimeout(() => setTestResult(null), 3000);
  };

  const exportSettings = () => {
    if (!settings) return;
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobpilot-settings.json';
    a.click();
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const imported = JSON.parse(text);
      setSettings(imported);
    };
    input.click();
  };

  if (!settings) return <div className="loading">Loading...</div>;

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>JobPilot Settings</h1>
        {saved && <div className="save-indicator">✓ Saved</div>}
      </header>

      <div className="options-content">
        {/* App Origins */}
        <section className="settings-section">
          <h2>Allowed App Origins</h2>
          <p className="section-description">
            Add the origins of your JobPilot web app to allow secure communication
          </p>

          <div className="origin-input">
            <input
              type="url"
              value={appOrigin}
              onChange={(e) => setAppOrigin(e.target.value)}
              placeholder="https://app.jobpilot.com"
              onKeyPress={(e) => e.key === 'Enter' && addOrigin()}
            />
            <button onClick={addOrigin} className="btn-primary">
              Add
            </button>
          </div>

          <div className="origins-list">
            {settings.appOrigins.map((origin) => (
              <div key={origin} className="origin-item">
                <span>{origin}</span>
                <button onClick={() => removeOrigin(origin)} className="btn-icon">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* HMAC Key */}
        <section className="settings-section">
          <h2>HMAC Shared Key</h2>
          <p className="section-description">
            Enter the shared key for message authentication (must match your web app)
          </p>

          <div className="hmac-input">
            <input
              type={showHmacKey ? 'text' : 'password'}
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Enter shared secret key"
            />
            <button onClick={() => setShowHmacKey(!showHmacKey)} className="btn-icon">
              {showHmacKey ? '🙈' : '👁'}
            </button>
          </div>
        </section>

        {/* Domain Settings */}
        <section className="settings-section">
          <h2>Platform Settings</h2>
          <p className="section-description">Configure settings for each job platform</p>

          <div className="domains-table">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Enabled</th>
                  <th>Legal Mode</th>
                  <th>Dry-Run Default</th>
                  <th>Rate Limit/min</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain}>
                    <td className="domain-name">{domain}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={settings.enabled[domain] ?? true}
                        onChange={() => toggleDomain(domain, 'enabled')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={settings.legal[domain] ?? false}
                        onChange={() => toggleDomain(domain, 'legal')}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={settings.dryRunDefault[domain] ?? true}
                        onChange={() => toggleDomain(domain, 'dryRunDefault')}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.rateLimit[domain] ?? 10}
                        onChange={(e) => updateRateLimit(domain, parseInt(e.target.value))}
                        className="rate-limit-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Language */}
        <section className="settings-section">
          <h2>Language</h2>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value as 'en' | 'tr' })}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
        </section>

        {/* Actions */}
        <section className="settings-section">
          <h2>Actions</h2>
          <div className="action-buttons">
            <button onClick={testBridge} className="btn-secondary">
              Test Bridge
            </button>
            <button onClick={exportSettings} className="btn-secondary">
              Export Settings
            </button>
            <button onClick={importSettings} className="btn-secondary">
              Import Settings
            </button>
          </div>
          {testResult && <div className="test-result">{testResult}</div>}
        </section>

        {/* Save */}
        <div className="save-section">
          <button onClick={saveSettings} className="btn-primary btn-large">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Options />);
}
