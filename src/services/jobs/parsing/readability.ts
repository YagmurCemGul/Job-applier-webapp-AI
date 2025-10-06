/**
 * Extract readable text from HTML
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
 * Extract meta tags from HTML
 */
export function extractMeta(html: string) {
  const g = (re: RegExp) => html.match(re)?.[1]

  return {
    title: g(/<title>([^<]+)<\/title>/i),
    ogTitle: g(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
    ogDescription: g(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
    siteName: g(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i),
  }
}

/**
 * Extract JSON-LD structured data from HTML
 */
export function extractJsonLd(html: string) {
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  )

  for (const b of blocks) {
    try {
      const j = JSON.parse(b[1])
      if (j['@type'] === 'JobPosting') {
        return {
          title: j.title,
          hiringOrganization: j.hiringOrganization?.name,
          datePosted: j.datePosted,
          validThrough: j.validThrough,
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return {}
}
