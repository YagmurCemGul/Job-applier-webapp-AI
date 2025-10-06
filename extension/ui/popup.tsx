import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { RunLog } from '../messaging/protocol'
import { getSettings, updateSettings } from '../storage/settings'

function Popup() {
  const [history, setHistory] = useState<RunLog[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    // Load history
    chrome.runtime.sendMessage({ type: 'GET_HISTORY' }, (response) => {
      setHistory(response || [])
    })

    // Load paused state
    getSettings().then((settings) => {
      setPaused(settings.paused)
    })
  }, [])

  const togglePause = async () => {
    const newPaused = !paused
    setPaused(newPaused)
    await updateSettings({ paused: newPaused })
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const clearHistory = () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, () => {
      setHistory([])
    })
  }

  return (
    <div>
      <h1>JobPilot</h1>

      <div className="toggle">
        <span>{paused ? 'Extension Paused' : 'Extension Active'}</span>
        <button
          className={paused ? 'secondary' : 'danger'}
          onClick={togglePause}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <h2>Recent Runs</h2>
      {history.length === 0 ? (
        <p style={{ color: '#718096', fontSize: '12px' }}>No runs yet</p>
      ) : (
        <div>
          {history.map((log) => (
            <div key={log.id} className="history-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`status ${log.status}`}>{log.status}</span>
                <span style={{ fontSize: '12px', color: '#718096' }}>
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                {log.domain} • {log.message}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <button onClick={openOptions}>Options</button>
        <button className="secondary" onClick={clearHistory}>
          Clear History
        </button>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}
