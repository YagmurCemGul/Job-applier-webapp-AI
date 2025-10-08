/**
 * HTTP Service
 * Step 32 - Simple HTTP client for job fetching
 */

/**
 * Fetch text content from URL with optional headers
 */
export async function httpGet(url: string, headers?: Record<string, string>): Promise<string> {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}
