/**
 * Example usage of extension bridge in web app (Step 33)
 */

import React, { useState, useEffect } from 'react';
import { ExtensionBridge } from './web-app-bridge';

// Initialize bridge (do this once in app root or context)
const bridge = new ExtensionBridge({
  hmacKey: process.env.NEXT_PUBLIC_EXTENSION_HMAC_KEY || 'dev-key-replace-in-production',
});

/**
 * Example: Auto-Apply Component
 */
export function AutoApplyButton({ job, profile }: { job: any; profile: any }) {
  const [isApplying, setIsApplying] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    // Check if extension is installed
    bridge.isExtensionInstalled().then(setExtensionInstalled);
  }, []);

  const handleAutoApply = async () => {
    setIsApplying(true);

    try {
      // Convert CV to blob URL (or use existing URL)
      const cvBlob = await fetch(profile.cvUrl).then((r) => r.blob());
      const cvBlobUrl = URL.createObjectURL(cvBlob);

      // Prepare files
      const files = [
        {
          name: profile.cvFileName || 'resume.pdf',
          url: cvBlobUrl,
          type: 'cv' as const,
        },
      ];

      // Prepare answers from profile
      const answers = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        linkedIn: profile.linkedIn,
        github: profile.github,
        portfolio: profile.portfolio,
      };

      // Send to extension
      const result = await bridge.sendApplyRequest({
        jobUrl: job.url,
        platform: job.platform,
        files,
        answers,
        dryRun: true, // Start with dry-run for safety
        locale: 'en',
      });

      // Handle result
      if (result.payload.ok) {
        if (result.payload.submitted) {
          // Application submitted
          alert('Application submitted successfully!');
          // Update job status in database
        } else if (result.payload.reviewNeeded) {
          // Dry-run completed, needs review
          alert('Form filled. Please review and submit manually.');
        }

        // Log details
        console.log('Apply logs:', result.payload.hints);
      } else {
        // Error occurred
        alert(`Error: ${result.payload.message}`);
      }

      // Clean up blob URL
      URL.revokeObjectURL(cvBlobUrl);
    } catch (error: any) {
      console.error('Auto-apply failed:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  if (!extensionInstalled) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          Install the JobPilot Extension to use Auto-Apply
        </p>
        <a
          href="https://chrome.google.com/webstore/..."
          className="text-blue-600 underline text-sm"
        >
          Install Extension →
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleAutoApply}
      disabled={isApplying}
      className="btn-primary"
    >
      {isApplying ? 'Applying...' : 'Auto-Apply'}
    </button>
  );
}

/**
 * Example: Quick Import Component
 */
export function QuickImportButton() {
  const [isImporting, setIsImporting] = useState(false);

  const handleQuickImport = async () => {
    setIsImporting(true);

    try {
      const jobData = await bridge.importCurrentJob();

      // Create job in database
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobData.payload.title,
          company: jobData.payload.company,
          location: jobData.payload.location,
          description: jobData.payload.description,
          url: jobData.payload.url,
          platform: jobData.payload.platform,
          salary: jobData.payload.salary,
          remote: jobData.payload.remote,
        }),
      });

      alert('Job imported successfully!');
    } catch (error: any) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <button
      onClick={handleQuickImport}
      disabled={isImporting}
      className="btn-secondary"
    >
      {isImporting ? 'Importing...' : 'Quick Import'}
    </button>
  );
}

/**
 * Example: Extension Status Indicator
 */
export function ExtensionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'not-installed'>('checking');

  useEffect(() => {
    async function checkStatus() {
      const installed = await bridge.isExtensionInstalled();

      if (!installed) {
        setStatus('not-installed');
        return;
      }

      const connected = await bridge.ping();
      setStatus(connected ? 'connected' : 'disconnected');
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    checking: { color: 'gray', text: 'Checking extension...' },
    connected: { color: 'green', text: 'Extension connected' },
    disconnected: { color: 'yellow', text: 'Extension not configured' },
    'not-installed': { color: 'red', text: 'Extension not installed' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 text-sm text-${config.color}-600`}>
      <div className={`w-2 h-2 rounded-full bg-${config.color}-500`} />
      <span>{config.text}</span>
    </div>
  );
}

/**
 * Example: Application Log Viewer
 */
export function ApplicationLogs({ result }: { result: any }) {
  if (!result?.payload?.hints) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Application Logs</h3>
      <div className="space-y-1">
        {result.payload.hints.map((log: string, i: number) => (
          <div key={i} className="text-xs text-gray-600 font-mono">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
