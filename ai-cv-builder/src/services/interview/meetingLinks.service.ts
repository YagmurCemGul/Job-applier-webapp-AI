/**
 * Meeting Links Service
 * Generates meeting links for Google Meet, Zoom, and other providers
 */

import type { MeetingProvider } from '@/types/interview.types';

/**
 * Extracts or generates a Google Meet link from calendar event
 */
export function makeMeetLink(eventHtmlLink?: string): string {
  if (!eventHtmlLink) return '#';
  
  // Google Calendar events with Meet usually include the link in htmlLink
  if (eventHtmlLink.includes('meet.google.com')) {
    return eventHtmlLink;
  }
  
  return eventHtmlLink;
}

/**
 * Returns a Zoom link (user-provided or placeholder)
 */
export function makeZoomLink(userLink?: string): string {
  return userLink || '#';
}

/**
 * Generates a meeting link based on provider
 */
export function generateMeetingLink(
  provider: MeetingProvider,
  eventHtmlLink?: string,
  userLink?: string
): string {
  switch (provider) {
    case 'google_meet':
      return makeMeetLink(eventHtmlLink);
    case 'zoom':
      return makeZoomLink(userLink);
    case 'other':
      return userLink || '#';
    default:
      return '#';
  }
}
