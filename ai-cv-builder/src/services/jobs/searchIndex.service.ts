/**
 * Search Index Service
 * Step 32 - Hybrid keyword + semantic search for jobs
 */

import type { JobNormalized } from '@/types/jobs.types';
import { aiEmbed } from '@/services/features/aiEmbed.service';

interface SearchIndex {
  byId: Map<string, JobNormalized>;
  keywords: Map<string, Set<string>>;
  vectors: Map<string, number[]>;
}

let idx: SearchIndex = reset();

function reset(): SearchIndex {
  return {
    byId: new Map(),
    keywords: new Map(),
    vectors: new Map()
  };
}

/**
 * Rebuild search index from jobs list
 */
export async function rebuildIndex(jobs: JobNormalized[]): Promise<void> {
  idx = reset();
  
  for (const j of jobs) {
    addToIndex(j);
  }
  
  // Semantic vectors (best-effort)
  const texts = jobs.map(j => 
    `${j.title} ${j.company} ${j.descriptionText.slice(0, 512)}`
  );
  
  const embeddings = await aiEmbed(texts).catch(() => []);
  if (embeddings.length === jobs.length) {
    jobs.forEach((j, i) => idx.vectors.set(j.id, embeddings[i]));
  }
}

/**
 * Add single job to index
 */
export function addToIndex(j: JobNormalized): void {
  idx.byId.set(j.id, j);
  
  const tokens = tokenize(`${j.title} ${j.company} ${j.location} ${j.descriptionText}`);
  
  for (const t of tokens) {
    const s = idx.keywords.get(t) ?? new Set<string>();
    s.add(j.id);
    idx.keywords.set(t, s);
  }
}

/**
 * Search jobs by keyword query
 */
export function search(query: string): string[] {
  const tokens = tokenize(query);
  const sets = tokens.map(t => idx.keywords.get(t) ?? new Set<string>());
  
  if (!sets.length) return [];
  
  let result = new Set<string>(sets[0]);
  for (const s of sets.slice(1)) {
    result = intersect(result, s);
  }
  
  return Array.from(result);
}

/**
 * Find K nearest neighbors for a job using semantic similarity
 */
export function knn(id: string, k = 10): string[] {
  const v = idx.vectors.get(id);
  if (!v) return [];
  
  const similarities: Array<[string, number]> = [];
  for (const [otherId, vec] of idx.vectors.entries()) {
    if (otherId === id) continue;
    similarities.push([otherId, cosine(v, vec)]);
  }
  
  return similarities
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([i]) => i);
}

// Helper functions
function tokenize(s: string): string[] {
  return (s || '')
    .toLowerCase()
    .split(/[^a-z0-9ğüşöçıİ\+\.#]+/)
    .filter(Boolean);
}

function intersect(a: Set<string>, b: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const x of a) {
    if (b.has(x)) out.add(x);
  }
  return out;
}

function cosine(a: number[], b: number[]): number {
  let s = 0, na = 0, nb = 0;
  
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    s += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  
  return s / Math.max(1e-9, Math.sqrt(na) * Math.sqrt(nb));
}
