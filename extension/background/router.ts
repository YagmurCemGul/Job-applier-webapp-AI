/**
 * Message router and domain handler dispatcher
 */

import { DomainKey } from '../storage/schema';
import { ApplyStartMsg } from '../messaging/protocol';

export class MessageRouter {
  /**
   * Determine platform from URL
   */
  getPlatformFromUrl(url: string): DomainKey | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      if (hostname.includes('greenhouse.io')) return 'greenhouse';
      if (hostname.includes('lever.co')) return 'lever';
      if (hostname.includes('workdayjobs.com')) return 'workday';
      if (hostname.includes('indeed.com')) return 'indeed';
      if (hostname.includes('linkedin.com')) return 'linkedin';

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate platform matches URL
   */
  validatePlatform(url: string, platform: DomainKey): boolean {
    const detected = this.getPlatformFromUrl(url);
    if (!detected) return platform === 'generic';
    return detected === platform;
  }

  /**
   * Get content script file for platform
   */
  getContentScriptForPlatform(platform: DomainKey): string {
    return `content/${platform}.js`;
  }

  /**
   * Check if URL requires specific content script injection
   */
  requiresInjection(url: string, platform: DomainKey): boolean {
    // Generic platform always requires injection as it's not in manifest
    return platform === 'generic';
  }
}
