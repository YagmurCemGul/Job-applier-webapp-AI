import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Settings, DomainKey } from '../storage/schema'
import { getSettings, updateSettings } from '../storage/settings'

function Options() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await updateSettings(settings)
    setSaving(false)
    alert('Settings saved!')
  }

  const addOrigin = () => {
    const origin = prompt('Enter app origin (e.g., https://app.example.com):')
    if (origin && settings) {
      setSettings({
        ...settings,
        appOrigins: [...settings.appOrigins, origin]
      })
    }
  }

  const removeOrigin = (origin: string) => {
    if (settings) {
      setSettings({
        ...settings,
        appOrigins: settings.appOrigins.filter((o) => o !== origin)
      })
    }
  }

  const toggleDomain = (domain: DomainKey, field: 'enabled' | 'legal' | 'dryRunDefault') => {
    if (settings) {
      setSettings({
        ...settings,
        [field]: {
          ...settings[field],
          [domain]: !settings[field][domain]
        }
      })
    }
  }

  if (!settings) {
    return <div>Loading...</div>
  }

  const domains: DomainKey[] = ['greenhouse', 'lever', 'workday', 'indeed', 'linkedin']

  return (
    <div>
      <h1>JobPilot Options</h1>

      <h2>App Origins</h2>
      <div className="field">
        <label>Allowed app origins (for secure bridge)</label>
        {settings.appOrigins.length === 0 ? (
          <p style={{ color: '#718096', fontSize: '12px' }}>No origins configured</p>
        ) : (
          <div>
            {settings.appOrigins.map((origin) => (
              <div key={origin} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f7fafc', borderRadius: '4px', marginBottom: '4px' }}>
                <span>{origin}</span>
                <button className="danger" onClick={() => removeOrigin(origin)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={addOrigin} style={{ marginTop: '8px' }}>
          Add Origin
        </button>
      </div>

      <h2>HMAC Key</h2>
      <div className="field">
        <label htmlFor="hmac">Shared HMAC key (for signature verification)</label>
        <input
          type="password"
          id="hmac"
          value={settings.hmacKey}
          onChange={(e) => setSettings({ ...settings, hmacKey: e.target.value })}
          placeholder="Enter shared key"
        />
      </div>

      <h2>Platform Settings</h2>
      {domains.map((domain) => (
        <div key={domain} className="toggle">
          <div>
            <strong>{domain}</strong>
            <div style={{ fontSize: '12px', color: '#718096' }}>
              Enabled: {settings.enabled[domain] ? '✓' : '✗'} |
              Legal: {settings.legal[domain] ? '✓' : '✗'} |
              Dry-Run: {settings.dryRunDefault[domain] ? '✓' : '✗'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="secondary"
              onClick={() => toggleDomain(domain, 'enabled')}
            >
              Toggle Enabled
            </button>
            <button
              className={settings.legal[domain] ? 'danger' : 'secondary'}
              onClick={() => toggleDomain(domain, 'legal')}
            >
              {settings.legal[domain] ? 'Disable Legal' : 'Enable Legal'}
            </button>
            <button
              className="secondary"
              onClick={() => toggleDomain(domain, 'dryRunDefault')}
            >
              Toggle Dry-Run
            </button>
          </div>
        </div>
      ))}

      <h2>Language</h2>
      <div className="field">
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value as 'en' | 'tr' })}
        >
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
        </select>
      </div>

      <div className="actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button className="secondary" onClick={() => window.location.reload()}>
          Reset
        </button>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Options />)
}
