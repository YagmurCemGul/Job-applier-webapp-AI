/**
 * @fileoverview Confidential banner for review pages
 * Shows warning about data sensitivity and retention policy
 */

import { Lock } from 'lucide-react';
import { useEffect } from 'react';

interface ConfidentialBannerProps {
  retentionDays?: number;
}

/**
 * Red dashed border banner with lock icon explaining confidentiality and retention
 */
export function ConfidentialBanner({ retentionDays }: ConfidentialBannerProps) {
  useEffect(() => {
    // Screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Confidential review data - for calibration use only';
    document.body.appendChild(announcement);
    
    return () => {
      document.body.removeChild(announcement);
    };
  }, []);
  
  return (
    <div
      className="border border-dashed border-red-500 bg-red-50 dark:bg-red-950 rounded-md p-3 mb-4 flex items-start gap-2"
      role="alert"
      aria-label="Confidential information notice"
    >
      <Lock className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="text-sm text-red-800 dark:text-red-200">
        <strong className="font-semibold">CONFIDENTIAL</strong> — for review/calibration use only.
        {retentionDays && (
          <span className="ml-2">
            Data retained for {retentionDays} days.
          </span>
        )}
      </div>
    </div>
  );
}
