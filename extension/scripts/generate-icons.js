/**
 * Generate simple SVG-based PNG icons for the extension
 * This creates placeholder icons until proper design assets are available
 */

import { createWriteStream } from 'fs';
import { mkdirSync } from 'fs';

// Ensure icons directory exists
mkdirSync('public/icons', { recursive: true });

const sizes = [16, 32, 48, 128];

const generateSVG = (size) => {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#grad)" />
  <text 
    x="50%" 
    y="50%" 
    text-anchor="middle" 
    dominant-baseline="central" 
    fill="white" 
    font-family="Arial, sans-serif" 
    font-weight="bold" 
    font-size="${size * 0.5}"
  >JP</text>
</svg>
  `.trim();
};

// Generate SVG files (since we can't easily generate PNG in Node without dependencies)
// Users should convert these to PNG or use a proper icon
sizes.forEach((size) => {
  const svg = generateSVG(size);
  const filename = `public/icons/${size}.svg`;
  
  const stream = createWriteStream(filename);
  stream.write(svg);
  stream.end();
  
  console.log(`✓ Generated ${filename}`);
});

console.log('\nNote: Convert SVG files to PNG using:');
console.log('  - Online tool: https://cloudconvert.com/svg-to-png');
console.log('  - Command line: convert icon.svg icon.png (ImageMagick)');
console.log('  - Design tool: Import SVG, export as PNG');
