/**
 * Simple HTTP client for job adapters
 */
export async function httpGet(url: string, headers?: Record<string, string>): Promise<string> {
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.text()
}
