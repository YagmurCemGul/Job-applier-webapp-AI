/**
 * Tracking utilities for open/click tracking
 * Backend endpoints are optional
 * In demo mode, pixel is a transparent data URI
 */

/**
 * Create open tracking pixel URL
 */
export function makeOpenPixel(trackingId?: string): string {
  if (!trackingId) {
    // 1x1 transparent GIF
    return `data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACwAAAAAAQABAAACAkQBADs=`
  }

  return `/api/trk/o.gif?id=${encodeURIComponent(trackingId)}`
}

/**
 * Wrap links in HTML for click tracking
 */
export function wrapLinksForClick(html: string, trackingId?: string): string {
  if (!trackingId) return html

  return html.replace(/<a\s+href="([^"]+)"/gi, (_m, href) => {
    const trackedUrl = `/api/trk/c?u=${encodeURIComponent(href)}&id=${encodeURIComponent(trackingId)}`
    return `<a href="${trackedUrl}"`
  })
}
