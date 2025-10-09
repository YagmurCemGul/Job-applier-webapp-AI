/**
 * @fileoverview Clipboard bundle service
 * Creates copy-pasteable text bundles for manual form filling
 */

/**
 * Build a single clipboard text block with Q&A + contact info for manual paste.
 * @param opts - Bundle options (name, email, phone, answers)
 * @returns Formatted text bundle
 */
export function buildClipboardBundle(opts: {
  name: string;
  email: string;
  phone?: string;
  answers: Array<{ q:string; a:string }>
}): string {
  const header = `${opts.name}\n${opts.email}${opts.phone?`\n${opts.phone}`:''}\n`;
  const qa = opts.answers.map((x,i)=> `${i+1}) ${x.q}\n${x.a}\n`).join('\n');
  return `${header}\n${qa}`.trim();
}
