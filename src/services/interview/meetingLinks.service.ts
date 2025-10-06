/**
 * Minimal link generators
 * Google Meet typically created by Calendar API
 * Zoom via user-provided link
 */

export function makeMeetLink(eventHtmlLink?: string): string {
  return eventHtmlLink || '#'
}

export function makeZoomLink(userLink?: string): string {
  return userLink || '#'
}
