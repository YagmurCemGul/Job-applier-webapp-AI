import type { JobNormalized } from '@/types/jobs.types'
import { aiEmbed } from '@/services/features/aiEmbed.service'

/**
 * Hybrid search index: keywords + semantic vectors
 */

let idx: {
  byId: Map<string, JobNormalized>
  keywords: Map<string, Set<string>>
  vectors: Map<string, number[]>
} = reset()

function reset() {
  return {
    byId: new Map(),
    keywords: new Map(),
    vectors: new Map(),
  }
}

/**
 * Rebuild the entire search index
 */
export async function rebuildIndex(jobs: JobNormalized[]) {
  idx = reset()

  for (const j of jobs) {
    addToIndex(j)
  }

  // Semantic vectors (best-effort via Step 31 AI)
  const texts = jobs.map((j) => `${j.title} ${j.company} ${j.descriptionText.slice(0, 512)}`)

  const emb = await aiEmbed(texts).catch(() => [])

  if (emb.length === jobs.length) {
    jobs.forEach((j, i) => idx.vectors.set(j.id, emb[i]))
  }
}

/**
 * Add single job to index
 */
export function addToIndex(j: JobNormalized) {
  idx.byId.set(j.id, j)

  const tokens = tokenize(`${j.title} ${j.company} ${j.location} ${j.descriptionText}`)

  for (const t of tokens) {
    const s = idx.keywords.get(t) ?? new Set<string>()
    s.add(j.id)
    idx.keywords.set(t, s)
  }
}

/**
 * Keyword search
 */
export function search(query: string): string[] {
  const tokens = tokenize(query)
  const sets = tokens.map((t) => idx.keywords.get(t) ?? new Set<string>())

  if (!sets.length) return []

  let res = new Set<string>(sets[0])
  for (const s of sets.slice(1)) {
    res = intersect(res, s)
  }

  return Array.from(res)
}

/**
 * K-nearest neighbors using cosine similarity
 */
export function knn(id: string, k = 10): string[] {
  const v = idx.vectors.get(id)
  if (!v) return []

  const sims: Array<[string, number]> = []

  for (const [other, vec] of idx.vectors.entries()) {
    if (other === id) continue
    sims.push([other, cosine(v, vec)])
  }

  return sims
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([i]) => i)
}

function tokenize(s: string): string[] {
  return (s || '')
    .toLowerCase()
    .split(/[^a-z0-9ğüşöçıİ+.#]+/)
    .filter(Boolean)
}

function intersect(a: Set<string>, b: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const x of a) {
    if (b.has(x)) out.add(x)
  }
  return out
}

function cosine(a: number[], b: number[]): number {
  let s = 0
  let na = 0
  let nb = 0

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    s += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }

  return s / Math.max(1e-9, Math.sqrt(na) * Math.sqrt(nb))
}
