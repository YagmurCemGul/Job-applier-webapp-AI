/**
 * Email tracking service for open/click tracking
 * Provides pixel URL generation and link wrapping
 */

/**
 * Generate tracking pixel URL
 * In demo mode, returns transparent 1x1 GIF data URI
 * In production, points to tracking endpoint
 */
export function makeOpenPixel(trackingId?: string): string {
  if (!trackingId) {
    // Transparent 1x1 GIF
    return `data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACwAAAAAAQABAAACAkQBADs=`;
  }

  return `/api/trk/o.gif?id=${encodeURIComponent(trackingId)}`;
}

/**
 * Wrap links with click tracking
 * Redirects through tracking endpoint
 */
export function wrapLinksForClick(html: string, trackingId?: string): string {
  if (!trackingId) return html;

  return html.replace(
    /<a\s+href="([^"]+)"/gi,
    (_, href) =>
      `<a href="/api/trk/c?u=${encodeURIComponent(href)}&id=${encodeURIComponent(trackingId)}"`
  );
}

/**
 * Generate unique tracking ID
 */
export function generateTrackingId(): string {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
