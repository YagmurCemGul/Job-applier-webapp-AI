/**
 * @fileoverview Open Graph image generator (client-side Canvas stub).
 * @module services/site/ogImage
 */

/**
 * Render an OG image (1200×630) using Canvas.
 * In production, use a serverless function with proper font rendering.
 */
export async function renderOgImage(
  title: string,
  options?: {
    primary?: string;
    accent?: string;
    fontFamily?: string;
  }
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = options?.primary ?? '#0f172a';
  ctx.fillRect(0, 0, 1200, 630);

  // Title
  ctx.fillStyle = options?.accent ?? '#e2e8f0';
  ctx.font = `bold 56px ${options?.fontFamily ?? 'Inter, system-ui, sans-serif'}`;
  ctx.textBaseline = 'top';
  wrapText(ctx, title, 80, 200, 1040, 64);

  // Watermark
  ctx.fillStyle = '#64748b';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('Published with JobPilot', 80, 530);

  return canvas.toDataURL('image/png');
}

/**
 * Wrap text within a max width, breaking on words.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = w + ' ';
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, yy);
}

/**
 * Generate an OG image URL from a base64 data URL (for testing).
 * In production, upload to CDN or use serverless renderer.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}