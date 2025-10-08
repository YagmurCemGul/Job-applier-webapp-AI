/**
 * Step 27: HTML extraction utilities (readability-style)
 */

/**
 * Extract clean text from HTML body
 * Removes scripts, styles, nav, header, footer
 */
export function extractTextFromHtml(html: string): string {
  const noScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const body = noScripts.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? noScripts

  const clean = body
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return clean
}

/**
 * Extract meta tags (Open Graph, Twitter, etc.)
 */
export function extractMeta(html: string) {
  const g = (re: RegExp) => html.match(re)?.[1]

  return {
    title: g(/<title>([^<]+)<\/title>/i),
    ogTitle: g(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
    ogDescription: g(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
    siteName: g(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i),
    twitterTitle: g(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i),
  }
}

/**
 * Extract JSON-LD structured data (JobPosting schema)
 */
export function extractJsonLd(html: string) {
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  )

  for (const b of blocks) {
    try {
      const j = JSON.parse(b[1])

      // Handle single object or array
      const items = Array.isArray(j) ? j : [j]

      for (const item of items) {
        if (item['@type'] === 'JobPosting') {
          return {
            title: item.title,
            hiringOrganization: item.hiringOrganization?.name,
            datePosted: item.datePosted,
            validThrough: item.validThrough,
            employmentType: item.employmentType,
            jobLocation: item.jobLocation?.address?.addressLocality,
          }
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return {}
}
