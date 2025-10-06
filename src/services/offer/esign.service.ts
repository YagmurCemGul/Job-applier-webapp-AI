/**
 * Minimal e-signature stub
 * Generates a signable HTML and marks status
 * In production, wire to DocuSign/Dropbox Sign API
 */

export async function startESign(opts: {
  html: string
  docTitle: string
}): Promise<{
  id: string
  url: string
  status: 'pending'
}> {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now())

  const url = URL.createObjectURL(
    new Blob([opts.html], { type: 'text/html' })
  )

  return {
    id,
    url,
    status: 'pending'
  }
}
