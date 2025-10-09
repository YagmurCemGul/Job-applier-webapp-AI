/**
 * @fileoverview Media recording service for Step 43
 * @module services/interview/recorder
 */

/**
 * Request user media with constraints
 * @param constraints - MediaStream constraints
 * @returns MediaStream
 * @throws Error if permission denied or not supported
 */
export async function getMedia(
  constraints: MediaStreamConstraints
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Media recording not supported in this browser');
  }
  return await navigator.mediaDevices.getUserMedia(constraints);
}

/**
 * Record a media stream with safe fallbacks
 * @param stream - MediaStream to record
 * @param kind - Type of recording (audio or video)
 * @returns Recorder control object
 */
export function recordStream(
  stream: MediaStream,
  kind: 'audio' | 'video'
): { stop: () => void; done: Promise<Blob> } {
  // Determine mime type based on kind
  const mimeType = kind === 'audio' ? 'audio/webm' : 'video/webm';

  // Create MediaRecorder with fallback mime types
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType });
  } catch {
    // Fallback to default mime type
    recorder = new MediaRecorder(stream);
  }

  const chunks: Blob[] = [];

  // Collect data chunks
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  // Create promise that resolves when recording stops
  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      resolve(blob);
    };
  });

  // Start recording with time slicing (250ms chunks to manage memory)
  recorder.start(250);

  return {
    stop: () => recorder.stop(),
    done
  };
}

/**
 * Create object URL from blob for playback
 * @param blob - Media blob
 * @returns Object URL
 */
export function createMediaUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke object URL to free memory
 * @param url - Object URL to revoke
 */
export function revokeMediaUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Download blob as file
 * @param blob - Blob to download
 * @param filename - Download filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = createMediaUrl(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  revokeMediaUrl(url);
}
