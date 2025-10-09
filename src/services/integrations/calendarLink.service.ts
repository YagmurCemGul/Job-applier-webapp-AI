/**
 * @fileoverview Calendar scheduler link service
 * Step 48: Networking CRM & Outreach Sequencer
 */

export function schedulerSnippet(url: string, title='Book a time'){
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
}
