export function buildVCard(opts: { 
  name: string; 
  email?: string; 
  phone?: string; 
  title?: string; 
  org?: string; 
  url?: string 
}) {
  return [
    'BEGIN:VCARD','VERSION:3.0',
    `FN:${opts.name}`, 
    opts.email?`EMAIL:${opts.email}`:'', 
    opts.phone?`TEL:${opts.phone}`:'',
    opts.title?`TITLE:${opts.title}`:'', 
    opts.org?`ORG:${opts.org}`:'', 
    opts.url?`URL:${opts.url}`:'',
    'END:VCARD'
  ].filter(Boolean).join('\n');
}
