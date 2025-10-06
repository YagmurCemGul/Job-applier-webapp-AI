import type { RenderContext } from '@/types/export.types'

/**
 * Render a safe filename using a template and a context of tokens
 */
export function renderFilename(tpl: string, ctx: RenderContext): string {
  const safe = (s?: string) => (s ?? '').replace(/[\\/:*?"<>|]+/g, '-').trim()

  const map: Record<string, string | undefined> = {
    '{FirstName}': ctx.FirstName,
    '{MiddleName}': ctx.MiddleName,
    '{LastName}': ctx.LastName,
    '{Role}': ctx.Role,
    '{Company}': ctx.Company,
    '{Date}': ctx.Date,
    '{JobId}': ctx.JobId,
    '{VariantName}': ctx.VariantName,
    '{Locale}': ctx.Locale,
  }

  let out = tpl
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(safe(v))
  }

  // Collapse spaces/double dashes
  return out.replace(/\s+/g, ' ').replace(/-+/g, '-').replace(/\s-\s/g, '-').trim()
}
