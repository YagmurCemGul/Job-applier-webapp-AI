/** LinkedIn stub: accepts exported CSV text and returns simplified rows. */
export function parseLinkedInExport(csv: string) {
  // Expect columns like: First Name, Last Name, Company, Position, Email Address
  const lines = csv.trim().split(/\r?\n/); 
  const hdr = lines.shift()?.split(',').map(h=>h.trim().toLowerCase()) ?? [];
  const idx = (k:string)=> hdr.indexOf(k);
  
  return lines.map(l => {
    const c = l.split(','); 
    const first = c[idx('first name')]||''; 
    const last = c[idx('last name')]||'';
    return { 
      name: `${first} ${last}`.trim(), 
      company: c[idx('company')]||'', 
      title: c[idx('position')]||'', 
      email: c[idx('email address')]||'' 
    };
  });
}
