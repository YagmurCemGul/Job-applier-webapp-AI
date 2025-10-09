/**
 * @fileoverview Transcript chunking service for Step 43
 * Split long transcripts into ~2k char chunks with sentence boundaries
 * @module services/interview/chunking
 */

/**
 * Split long transcript into chunks with sentence boundaries
 * @param text - Full transcript text
 * @param size - Target chunk size in characters
 * @returns Array of text chunks
 */
export function chunkTranscript(text: string, size = 2000): string[] {
  const out: string[] = [];
  let buf = '';

  // Split on sentence boundaries
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const s of sentences) {
    const combined = buf + (buf ? ' ' : '') + s;

    if (combined.length > size && buf) {
      // Current buffer is full, push it and start new chunk
      out.push(buf.trim());
      buf = s;
    } else {
      // Add to current buffer
      buf = combined;
    }
  }

  // Push remaining buffer
  if (buf.trim()) {
    out.push(buf.trim());
  }

  return out;
}

/**
 * Split transcript into time-based chunks
 * @param segments - Transcript segments with timestamps
 * @param chunkDurationSeconds - Target chunk duration
 * @returns Array of segment chunks
 */
export function chunkByTime(
  segments: Array<{ t0: number; t1: number; text: string }>,
  chunkDurationSeconds = 120
): Array<Array<{ t0: number; t1: number; text: string }>> {
  const chunks: Array<Array<{ t0: number; t1: number; text: string }>> = [];
  let currentChunk: Array<{ t0: number; t1: number; text: string }> = [];
  let chunkStart = 0;

  for (const seg of segments) {
    if (seg.t0 - chunkStart >= chunkDurationSeconds && currentChunk.length > 0) {
      chunks.push([...currentChunk]);
      currentChunk = [];
      chunkStart = seg.t0;
    }
    currentChunk.push(seg);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Merge small segments into larger ones
 * @param segments - Transcript segments
 * @param minDuration - Minimum segment duration in seconds
 * @returns Merged segments
 */
export function mergeSmallSegments(
  segments: Array<{ t0: number; t1: number; text: string }>,
  minDuration = 5
): Array<{ t0: number; t1: number; text: string }> {
  if (segments.length === 0) return [];

  const merged: Array<{ t0: number; t1: number; text: string }> = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const currentDuration = current.t1 - current.t0;

    if (currentDuration < minDuration) {
      // Merge with next segment
      current.t1 = seg.t1;
      current.text += ' ' + seg.text;
    } else {
      // Current segment is long enough, push and start new
      merged.push(current);
      current = { ...seg };
    }
  }

  merged.push(current);
  return merged;
}
