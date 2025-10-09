export function buildSignature(name: string, title?: string, links?: {label:string;url:string}[]) {
  const l = (links||[]).map(x=> `<a href="${x.url}" target="_blank" rel="noopener noreferrer">${x.label}</a>`).join(' · ');
  return `<p style="color:#64748b">${name}${title?` — ${title}`:''}${l ? `<br>${l}`:''}</p>`;
}
