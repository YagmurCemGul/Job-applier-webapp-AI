import type { IntroEdge, IntroPath } from '@/types/graph.types';

/** Dijkstra-like best-path with edge weights (strength+reciprocity). */
export function bestIntroPath(startId: string, targetId: string, edges: IntroEdge[]): IntroPath | null {
  const adj = new Map<string, IntroEdge[]>();
  for (const e of edges) { const arr = adj.get(e.fromId) ?? []; arr.push(e); adj.set(e.fromId, arr); }
  const scoreEdge = (e:IntroEdge)=> (e.strength + (e.reciprocity ?? 0)) / 3.5; // ~0..1
  const dist = new Map<string, number>(); const prev = new Map<string, string>(); const visited = new Set<string>();
  const q = new Set<string>(Array.from(new Set(edges.flatMap(e=>[e.fromId, e.toId, startId, targetId]))));
  for (const v of q) dist.set(v, v===startId?0:Infinity);
  while (q.size){
    const u = Array.from(q).reduce((a,b)=> (dist.get(a)! < dist.get(b)! ? a : b));
    q.delete(u); visited.add(u);
    if (u===targetId) break;
    for (const e of (adj.get(u) ?? [])) {
      const alt = dist.get(u)! + (1 - scoreEdge(e)); // lower cost for stronger edges
      if (alt < (dist.get(e.toId) ?? Infinity)) { dist.set(e.toId, alt); prev.set(e.toId, u); }
    }
  }
  if (!prev.has(targetId)) return null;
  const path = [targetId]; let u = targetId; while (prev.has(u)){ u = prev.get(u)!; path.unshift(u); if (u===startId) break; }
  const hops = path.length - 1; const score = 1 - Math.min(1, (dist.get(targetId) ?? 1)/Math.max(1,hops));
  return { path, score, hops };
}
